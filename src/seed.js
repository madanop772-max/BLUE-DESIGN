import { randomUUID } from 'node:crypto';
import { instructionPlan } from './planning.js';
export const review = `Low centre of gravity. Put the battery and motors in the base and keep the torso, head and arms light, because a tall body on a small base can tip when it brakes or goes over a bump.\nTray load. Decide the maximum tray payload now, since it drives the motor torque and battery sizing from your design note.\nSensor placement. The LiDAR on top of the base is the right spot for 2D SLAM. Put the camera in the head or above the touchscreen for YOLO person detection.\nArms and head. Treat them as static or cosmetic for the first version. Moving them adds servos, power draw and software that your 10-stage plan doesn’t include.`;
const component = (id,name,category,description,quantity,cost,specs={},connections=[]) => ({id,name,category,description,quantity,cost,specs,connections,material:'',tips:'Check dimensions against the manufacturer drawing before fabrication.',geometry:null,files:[]});
export function robotProject(name='Autonomous Service Robot') {
 const parts = [
 component('fl_motor_mount','FL Motor Mount','3D PRINT','Custom bracket for mounting the front-left motor to the 2020 extrusion frame.',1,4,{'Recommended Material':'PETG or Carbon Fiber Reinforced Nylon','Recommended Layer Height':'0.2mm','Infill Percentage':'40% (Gyroid pattern)','Support Requirements':'Supports needed for internal screw holes and overhangs','Print Orientation':'Flat base on build plate for maximum structural integrity','Estimated Print Time':'3.5 - 5 hours depending on printer speed','Dimensional Specifications':'Fits standard 60mm diameter hub motors with M4 mounting pattern','Wall Thickness':'4mm'},['main_chassis','drive_wheel','front_left_motor']),
 component('main_chassis','Main Aluminum Chassis','STRUCTURE','2020 Aluminum Extrusion V-Slot',1,48,{'Profile':'2020 V-Slot','Frame Width':'400mm','Frame Length':'450mm','Material':'6063-T5 Aluminum'},['fl_motor_mount','battery']),
 component('drive_wheel','Drive Wheel','HARDWARE','Robot Wheel 120mm',2,15,{'Diameter':'120mm','Tread':'Rubber','Shaft Bore':'6mm'},['front_left_motor']),
 component('front_left_motor','Front Left Drive Motor','ELECTRONICS','12V DC Geared Encoder Motor',1,32,{'Voltage':'12V DC','Speed':'150 RPM','Encoder':'Quadrature'},['motor_driver','drive_wheel']),
 component('front_right_motor','Front Right Drive Motor','ELECTRONICS','12V DC Geared Encoder Motor',1,32,{'Voltage':'12V DC','Speed':'150 RPM'},['motor_driver']),
 component('lidar','LiDAR Navigation Sensor','SENSOR','360° laser ranging module for indoor navigation',1,99,{'Coverage':'360°','Interface':'USB / UART'},['controller']),
 component('battery','Battery Pack','POWER','12V 10Ah LiFePO4 rechargeable battery',1,65,{'Voltage':'12V','Capacity':'10Ah','Position':'Chassis base'},['fuse','motor_driver','buck_converter']),
 component('controller','Main Controller','ELECTRONICS','Single-board computer for navigation and planning',1,75,{'Memory':'8GB','Operating System':'Linux / ROS 2'},['lidar','camera','motor_driver']),
 component('motor_driver','Dual Motor Driver','ELECTRONICS','Dual-channel DC motor controller',1,24,{'Supply':'12V','Channels':'2'},['front_left_motor','front_right_motor']),
 component('camera','RGB Camera','SENSOR','USB camera for person detection',1,25,{'Interface':'USB 2.0','Resolution':'1080p'},['controller']),
 component('touchscreen','Touch Display','ELECTRONICS','7-inch capacitive touchscreen',1,49,{'Size':'7 inch','Interface':'HDMI + USB'},['controller']),
 component('tray','Service Tray','STRUCTURE','Lightweight removable payload tray',1,18,{'Payload':'To be specified','Material':'ABS'},['main_chassis']),
 component('caster','Rear Caster Wheel','HARDWARE','Swivel caster for three-point stability',1,8,{'Diameter':'50mm'},['main_chassis']),
 component('emergency_stop','Emergency Stop','POWER','Latching emergency stop switch',1,8,{'Type':'Normally closed'},['battery','fuse']),
 component('fuse','Inline Fuse Holder','POWER','Battery protection fuse and holder',1,5,{'Rating':'Select from measured load'},['battery','motor_driver']),
 component('buck_converter','DC Buck Converter','POWER','12V to 5V regulated power module',1,9,{'Input':'12V','Output':'5V'},['controller']),
 ...[['fr_motor_mount','FR Motor Mount'],['lidar_mount','LiDAR Mount'],['camera_mount','Camera Mount'],['display_bezel','Display Bezel'],['battery_holder','Battery Holder'],['cable_clips','Cable Management Clips'],['top_cover','Top Cover'],['head_shell','Head Shell'],['left_arm','Left Cosmetic Arm'],['right_arm','Right Cosmetic Arm']].map(([id,n])=>component(id,n,'3D PRINT',`Custom printed ${n.toLowerCase()} for the service robot`,1,4,{'Material':'PETG','Layer Height':'0.2mm'},['main_chassis']))
 ];
 parts[0].longDescription="The FL Motor Mount is a custom 3D-printed bracket designed to securely couple the front-left hub motor to the autonomous rover’s chassis frame. It is engineered to withstand torque-induced vibrations while maintaining precise alignment of the drive assembly within the navigation platform.";
 parts[0].geometry={kind:'bracket',width:80,depth:65,height:75,wall:4,hole:36};
 parts[0].material='PETG is a practical starting point for fit prototypes. Reinforced nylon offers greater stiffness. Validate print orientation and fastener loads with physical testing.';
 const now = new Date().toISOString();
 const project={id:randomUUID(),name,description:'An autonomous indoor service robot with a modular aluminum chassis, differential drive, LiDAR navigation, and a touchscreen interface.',createdAt:now,updatedAt:now,version:1,parts,messages:[{id:randomUUID(),role:'assistant',text:review,createdAt:now,provider:'design review'}],instructions:[],history:[{id:randomUUID(),title:'Project created',at:now}],published:null};
 project.instructions=instructionPlan(project);return project;
}
