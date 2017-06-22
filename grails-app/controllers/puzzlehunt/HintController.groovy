package puzzlehunt

import grails.converters.JSON

class HintController {

    def index() {

    }
    
    def getHints() {
        def list = Hint.list().collect { h ->
            [id: h.id,
             question: h.question,
             puzzle: h.puzzle.name,
             player: h.player.name,
             owner: h.owner ? h.owner.name : "--",
             status: h.owner ? "unclaim" : "claim",
             action : h.closed ? "closed" : "open",
             createTime : h.createTime,
             owned : h.owner ? (h.owner.id == session.playerId ? true : false) : false]
        }
        
        def ret = [hints : list.sort{[it.action, it.owned, it.owner, it.createTime]}]
        render ret as JSON
    }

    def requestHint() {
        def pl = Player.findByNameAndId(params.playername, params.playerid)
        def pu = Puzzle.findByNameAndId(params.puzzlename, params.puzzleid)
        def hn = new Hint(player:pl, 
                          puzzle:pu, 
                          owner: uu, 
                          question: params.question, 
                          notes: "NO NOTES")
        hn.save()
    }

    def refreshlist() {
        redirect controller: "hint", action: "index"
    }
    
    def toggle() {
        def uh = Hint.findById(params.hintid)
        if (!uh.owner && !uh.closed)
        {
            redirect controller: "hint", action: "details", 
                                         params: [hintid: params.hintid, 
                                                  notice: "cannot close unclaimed hint"]
        }
        else 
        {
            if (uh.closed) {
                uh.closed = false
            }
            else {
                uh.closed = true
            }
            uh.save(flush : true)
            redirect controller: "hint", action: "details", 
                                         params: [hintid: params.hintid, 
                                                  notice: "ticket state updated"]
        }
    }

    def claim() {
        def uh = Hint.findById(params.hintid)
        def ap = Player.findById(session.playerId)
        def ret = [ owner : "--", action : "claim" ]
        if (uh.owner) {
            println "unlocking hint request"
            uh.owner = null
            uh.save(flush : true)
        }
        else if (ap && uh) {
            println "claiming hint request"
            uh.owner = ap
            uh.save(flush : true)
            ret = [ owner : ap.name, action : "unclaim" ]
        }
        
        render ret as JSON;
    }
    
    def details() {
        if (params.hintid)
        {
            println "showing details hintid:" + params.hintid
            def uh = Hint.findById(params.hintid)
            def hinterName = uh.owner ? uh.owner.name : "--"
            println "action " + uh.closed
            def actionBlob = uh.closed ? "re-open" : "done"
            println "derived action " + actionBlob
            render(view: "details", model: [hintid: params.hintid,
                                            hinterName: hinterName,
                                            playerName: uh.player.name,
                                            phone: uh.phone,
                                            nexi: uh.nexi,
                                            puzzleName: uh.puzzle.name,
                                            question: uh.question,
                                            puzzleLink: "<link to puzzle>",
                                            solution: "<link to solution>",
                                            notes: uh.notes,
                                            notice: params.notice,
                                            action : uh.closed ? "re-open" : "done"])
        }
        else
        {
            println "error, no hintid passed"
        }
    }
    
    def updateNote() {
        println "param entry notes"
        def uh = Hint.findById(params.hintid)
        uh.notes = params.entrynotes
        uh.save(flush : true)
        redirect controller: "hint", action: "details", 
                                     params: [hintid: params.hintid, 
                                              notice: "note updated"]
    }
    
}
