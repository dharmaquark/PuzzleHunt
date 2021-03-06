package puzzlehunt

class Player {
    String name
    String password
    String role
    Long lastHint = 0
    long hintRegen = 1000 * 60 * 20

    static constraints = {
        name unique: true
        role nullable: true
        lastHint nullable: true
    }

    def getSolvedPuzzles() {
        Attempt.where { player == this } findAll {it.isCorrect} *.puzzle
    }

    def hasSolved(Puzzle puz) {
        Attempt.where { player == this && puzzle == puz } *.isCorrect .contains true
    }

    def getSolvablePuzzles() {
        def solved = getSolvedPuzzles()*.id
        Puzzle.list().findAll { p-> p.id in solved || !p.requiredPuzzles || p.requiredPuzzles*.puzzle.findAll {rp -> rp.id in solved}.size() }
    }

    def isSolvable(Puzzle puzzle) {
        println "req ${puzzle.requiredPuzzles*.puzzle*.name}"
        hasSolved(puzzle) || !puzzle.requiredPuzzles || puzzle.requiredPuzzles*.puzzle.findAll { p-> hasSolved(p) } .size()
    }

    def getLastSubmission() {
        def item = Attempt.where {timestamp == max(timestamp).of{ player==this } && player==this }.list()
        item.size() ? item.first().timestamp : 0
    }

    static hasMany = []
}
