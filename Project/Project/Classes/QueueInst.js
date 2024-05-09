class QueueInst {
    constructor (
	Instruction,
    Dest,
    J,
    K,
    IssueCycle,
    ExecutionCycles,
    WritingBackCycles,
    Latency,
    IdRes,
    Pos,
    ){
        this.Instruction=Instruction,
        this.Dest=Dest,
        this.J=J,
        this.K=K,
        this.IssueCycle=IssueCycle,
        this.ExecutionCycles=ExecutionCycles,
        this.WritingBackCycles=WritingBackCycles
        this.Latency = Latency
        this.IdRes=IdRes
        this.Pos=Pos
    }

} 
module.exports=QueueInst