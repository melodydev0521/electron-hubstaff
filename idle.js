const { powerMonitor } = requre('electron');

export const detectIdle = () => {
    powerMonitor.querySystemIdleTime((idleSecs)=>{
        console.log(`The system has been idle for ${idleSecs} seconds.`)
    })
}
