import { parameters } from './cad.js';
export async function designReply(project,text,mode,partId,config=process.env){
 if(mode==='Edit'&&config.AI_PROVIDER!=='local'&&(/^(?:rename (?:this )?project to )/i.test(text)||/(?:set|change|make|increase|decrease)\s+(?:(?:the|mount|bracket)\s+)*(?:width|depth|height|wall(?:\s+thickness)?|(?:motor\s+)?hole(?:\s+diameter)?)\s*(?:to|=|:)?\s*\d/i.test(text)))return designReply(project,text,mode,partId,{...config,AI_PROVIDER:'local'});
 const part=project.parts.find(p=>p.id===partId)||project.parts[0];
 if(config.AI_PROVIDER==='openai'||config.AI_PROVIDER==='ollama'){
  const context=`You are a hardware design assistant in an independent open-source workspace. Give practical, concise engineering guidance. Never claim CAD modifications or physical verification. The application applies edits separately. Distinguish assumptions from specifications. Project: ${JSON.stringify({name:project.name,description:project.description,parts:project.parts.map(({files,...p})=>p)})}`;
  let reply;
  if(config.AI_PROVIDER==='openai'){
   if(!config.OPENAI_API_KEY)throw Object.assign(new Error('OpenAI API key is missing. Configure blueprint/.env or use Local mode in Settings.'),{status:503});
   const r=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${config.OPENAI_API_KEY}`},body:JSON.stringify({model:config.OPENAI_MODEL||'gpt-4o',store:false,instructions:context,input:[...project.messages.slice(-12).filter(m=>['user','assistant'].includes(m.role)).map(m=>({role:m.role,content:m.text})),{role:'user',content:text}],max_output_tokens:1600}),signal:AbortSignal.timeout(60000)});
   if(!r.ok)throw Object.assign(new Error(`AI provider returned HTTP ${r.status}. Check your model, key, and account quota.`),{status:502});
   const d=await r.json();reply=d.output?.flatMap(x=>x.content||[]).filter(x=>x.type==='output_text').map(x=>x.text).join('\n');
  }else{
   const base=config.OLLAMA_URL||'http://127.0.0.1:11434';const r=await fetch(`${base.replace(/\/$/,'')}/api/chat`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:config.OLLAMA_MODEL||'llama3.2',stream:false,messages:[{role:'system',content:context},...project.messages.slice(-12).map(m=>({role:m.role,content:m.text})),{role:'user',content:text}]}),signal:AbortSignal.timeout(90000)});
   if(!r.ok)throw Object.assign(new Error(`Ollama returned HTTP ${r.status}. Start Ollama and install the configured model.`),{status:502});reply=(await r.json()).message?.content;
  }
  if(!reply)throw Object.assign(new Error('AI provider returned no text.'),{status:502});return {text:reply,provider:config.AI_PROVIDER};
 }
 if(mode==='Edit'){
  const match=text.match(/(?:set|change|make|increase|decrease)\s+(?:(?:the|mount|bracket)\s+)*(width|depth|height|wall(?:\s+thickness)?|(?:motor\s+)?hole(?:\s+diameter)?)\s*(?:to|=|:)?\s*(\d+(?:\.\d+)?)\s*(mm|cm)?/i);
  if(match&&part?.geometry){const field=match[1].toLowerCase().startsWith('wall')?'wall':match[1].toLowerCase().includes('hole')?'hole':match[1].toLowerCase();const value=Number(match[2])*(match[3]?.toLowerCase()==='cm'?10:1);const geometry=parameters({...part.geometry,[field]:value});return {text:`Updated ${part.name}: ${field} is now ${value}mm. The parametric model and future CAD exports use the new value. Check fit and loading before fabrication.`,provider:'local commands',patch:{partId:part.id,geometry:{kind:'bracket',...geometry}}};}
  const rename=text.match(/^rename (?:this )?project to (.+)$/i);if(rename)return {text:`Renamed the project to “${rename[1].trim()}”.`,provider:'local commands',patch:{name:rename[1].trim().slice(0,100)}};
  return {text:`Saved your design requirement: “${text}”.\n\nLocal mode supports precise edits such as “set wall thickness to 5mm” on a motor mount and “rename project to Warehouse Robot”. Use Edit part to change specifications and connections. For open-ended design reasoning, connect OpenAI or Ollama in Settings.`,provider:'local commands'};
 }
 const spec=part?Object.entries(part.specs).map(([k,v])=>`${k}: ${v}`).join('\n'):'';
 return {text:`${part?part.name:project.name}\n${part?.description||project.description}\n\n${spec}\n\n${/battery|power|runtime/i.test(text)?'Runtime estimate: usable watt-hours ÷ average load in watts. Measure drive and compute power before selecting capacity.':/material|print|wall/i.test(text)?'Use the saved material and print settings as prototype targets. Print a fit sample and check loads, clearances, temperature, and fasteners.':'This is the stored project context. Local mode can inspect specifications and apply explicit dimension edits; connect a language model in Settings for a detailed answer to your question.'}`,provider:'local commands'};
}
