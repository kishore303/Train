import { Injectable } from '@nestjs/common';

@Injectable()
export class S101Service {
  scenario(){
    const tasks=[
      {id:'S101-ENG', title:'Engineering Track Renewal', department:'Engineering', duration:45, sectionId:'SEC004', km:'120-121', type:'TRACK'},
      {id:'S101-ELE', title:'Electrical OHE Maintenance', department:'Electrical', duration:30, sectionId:'SEC004', km:'120-121', type:'OHE'},
      {id:'S101-SNT', title:'S&T Signal Overhauling', department:'S&T', duration:30, sectionId:'SEC004', km:'120-121', type:'SIGNAL'},
    ];
    // BEFORE: 3 separate blocks
    const before={
      blocks:3,
      totalDuration: tasks.reduce((s,t)=>s+t.duration,0), // 105 min
      estimatedDelay: 45+30+20, // if separate: sum of individual delays (deterministic demo)
      assetDowntime: 105,
      description:'3 separate maintenance blocks (uncoordinated)'
    };
    // Check compatibility for coordinated
    const allSameSection = new Set(tasks.map(t=>t.sectionId)).size===1;
    const totalDurationCoordinated = 60; // max overlapping: engineering 45 is longest, but need 45+buffer => 60 (demo)
    const coordinatedDelay = 18; // single window delay
    const after={
      blocks:1,
      totalDuration: totalDurationCoordinated,
      estimatedDelay: coordinatedDelay,
      assetDowntime: 60,
      description:'1 coordinated block (Engineering+Electrical+S&T coordinated)',
      recommendedWindow:'02:00-03:00',
      compatible: allSameSection,
    };
    const blockReduction = ((before.blocks - after.blocks)/before.blocks*100);
    const delayReduction = ((before.estimatedDelay - after.estimatedDelay)/before.estimatedDelay*100);
    const downtimeReduction = ((before.assetDowntime - after.assetDowntime)/before.assetDowntime*100);
    const coordinationEfficiency = 95; // synthetic demo
    const availabilityImprovement = downtimeReduction*0.6; // proxy
    return {
      scenario:'S101 — 1km section, Engineering 45m + Electrical 30m + S&T 30m',
      tasks,
      before,
      after,
      metrics:{
        blockReduction: Math.round(blockReduction), // 66
        delayReduction: Math.round(delayReduction),
        coordinationEfficiency,
        assetAvailabilityImprovement: Math.round(availabilityImprovement),
        downtimeReduction: Math.round(downtimeReduction),
      },
      recommendation: after.compatible ? {
        type:'ONE COORDINATED BLOCK',
        window: after.recommendedWindow,
        reason:'All 3 tasks same section (SEC004), compatible isolation can be coordinated with single traffic block — OR-Tools minimizes disruption vs 3 separate windows',
        aiMode:'XGBoost/RF synthetic + OR-Tools CP-SAT',
        disclaimer:'Synthetic demonstration result. AI only RECOMMENDS — human approval mandatory.'
      } : {type:'NOT COMPATIBLE - keep separate'},
      disclaimer:'Synthetic demonstration result. BEFORE 3 blocks → AFTER 1 coordinated block.'
    };
  }
}
