/* global jQuery */
//= require jquery-3.2.0

function showDialog(text, cb) {
    var modal = $("#modal");
    var modalRoot = $("#modal-root");
    modal.css("visibility", "visible");
    modalRoot.css("height", "150px");
    modalRoot.css("width", "400px");
    modalRoot.empty();

    var pane = $("<div style='position:absolute; width:100%; height 100%' />");
    var label = $("<label class='modal-label' />");
    pane.append(label);
    pane.append($("<br/>"));
    var close = $("<input type='button' value='close' class='modal-button-close' />");
    close.css("left", "115px");
    close.css("top", "80px");
    close.click(function () {
        pane.remove();
        modal.css("visibility", "hidden");
        if (cb) cb();
    });
    pane.append(close);

    label.text(text);
    modalRoot.append(pane);
}

function showConfirmDialog(text, yText, nText, cb) {
    var modal = $("#modal");
    var modalRoot = $("#modal-root");
    modal.css("visibility", "visible");
    modalRoot.css("height", "170px");
    modalRoot.css("width", "500px");
    modalRoot.empty();

    var pane = $("<div style='position:absolute; width:100%; height 100%' />");
    var label = $("<label class='modal-label' />");
    pane.append(label);
    pane.append($("<br/>"));


    var close = $("<input type='button' value='" + yText + "' class='modal-button-close' />");
    close.css("left", "75px");
    close.css("top", "100px");
    close.click(function () {
        pane.remove();
        modal.css("visibility", "hidden");
        if (cb) cb();
    });
    pane.append(close);

    var closeNo = $("<input type='button' value='" + nText + "' class='modal-button-close' />");
    closeNo.css("left", "255px");
    closeNo.css("top", "100px");
    closeNo.click(function () {
        pane.remove();
        modal.css("visibility", "hidden");
    });
    pane.append(closeNo);


    label.text(text);
    modalRoot.append(pane);
}

function showLoading(text) {
    var modal = $("#modal");
    var modalRoot = $("#modal-root");
    modal.css("visibility", "visible");
    modalRoot.css("height", "100px");
    modalRoot.css("width", "300px");
    modalRoot.empty();

    var pane = $("<div style='position:absolute; width:100%; height 100%' />");
    var label = $("<label class='modal-label' style='top: 20px; left:70px; color:orange' />");
    pane.append(label);

    label.text(text ? text : "Loading...");
    modalRoot.append(pane);
}

function closeLoading() {
    var modal = $("#modal");
    var modalRoot = $("#modal-root");
    modalRoot.empty();
    modal.css("visibility", "hidden");
}

function showHintDialog(puzzleId, puzzleName, hintText) {
    $.get("nextHintTime", function (nextHintTime) {
        var modal = $("#modal");
        var modalRoot = $("#modal-root");
        modal.css("visibility", "visible");
        modalRoot.css("height", "500px");
        modalRoot.css("width", "500px");
        modalRoot.empty();

        var pane = $("<div style='padding: 20px; 20px; 20px; 20px;' />");


        modalRoot.append(pane);


        pane.append($("<label style='color: white; display: block; font-size: 24px; margin-top: 20px;'>To request your next hint, please enter as much detailed information as possible about what you have tried so far.</label>"));

        pane.append($("<label style='color: white; display: inline-block; font-size: 22px; margin-top: 20px;'>Puzzle:&nbsp;</label><label style='color: lightgreen; display: inline-block; font-size: 22px' >" + puzzleName + "<label/>"));

        var availableLabel = $("<label style='color: white; display: block; font-size: 24px; margin-top: 20px;'></label>");
        pane.append(availableLabel);

        var hintEntry = $("<textarea style='resize: none; font-size: 16px; width: 100%; margin-top: 20px; height: 150px; box-sizing: border-box' />");
        pane.append(hintEntry);
        hintEntry.text(hintText ? hintText : "");

        var timer = setInterval(function () {

            var left = Math.max(0, nextHintTime - new Date().getTime()) / 1000;
            if (left <= 0) {
                availableLabel.text("Your hint is available now...");
            } else {
                var pad = function (t) {
                    return t < 10 ? '0' + parseInt(t) : parseInt(t);
                };
                availableLabel.text("Next hint available in: " + pad((left / 3600) % 60) + ":" + pad((left / 60) % 60) + ":" + pad(left % 60));
            }

        }, 25);

        var close = $("<input type='button' value='Request Hint' class='modal-button-close' />");
        close.css("left", "35px");
        close.css("top", "430px");
        close.click(function () {
            var hintRequest = hintEntry.val();
            if (!hintRequest) return;
            $.post("requestHint", {id: puzzleId, question: hintRequest}, function (data) {
                clearInterval(timer);
                pane.remove();
                modal.css("visibility", "hidden");

                showDialog(data.success ? "Submitted. Someone will help shortly!" : data.error, data.success ? null : function () {
                    showHintDialog(puzzleId, puzzleName, hintRequest);
                });

            });
        });
        pane.append(close);

        var closeNo = $("<input type='button' value='Cancel' class='modal-button-close' />");
        closeNo.css("left", "285px");
        closeNo.css("top", "430px");
        closeNo.click(function () {
            clearInterval(timer);
            pane.remove();
            modal.css("visibility", "hidden");
        });
        pane.append(closeNo);

//
//    $.post("requestHint", {id: puzzle.id, question: hintEntry.val()}, function (data) {
//        hintDiv.html("");
//        hintDiv.append($("<label style='color: white'>Submitted</label>"));
//    });

    });
}


var removePanes = [];
var removeTimers = [];
function clearPanes() {
    console.log("clearing", removePanes);
    removePanes.forEach(function (pane) {
        pane.remove();
    });
    removePanes = [];

    removeTimers.forEach(function (timer) {
        clearInterval(timer);
    });
    removeTimers = [];
}


var puzzlePoints = [];
function clearPoints() {
    clearPanes();
    puzzlePoints.forEach(function (puzzlePoint) {
        if (puzzlePoint) {
            puzzlePoint.remove();
        }
    });
    puzzlePoints = [];
}

var rounds = {};
function reloadMap(openPuzzleId) {
    clearPanes();
    $.get("getPuzzles", function (playerData) {
        console.log(playerData);
        var rootPane = $("#rootPane");
        var pMap = {};

        playerData.rounds.forEach(function (round) {
            if (rounds[round.id]) {
                return;
            }
            rounds[round.id] = round;
            var paneDiv = $("<div style='margin: auto; width: " + round.width + "px ;height: " + round.height + "px'>");
            rootPane.append(paneDiv);
            var img = $("<img src=getResource?accessor=" + round.background + " style='position: absolute; z-index: 1'>");
            paneDiv.append(img);

            var puzzlePoints = $("<div style='position: absolute; z-index: 2; width: " + round.width + "px; height: " + round.height + "px'>");
            paneDiv.append(puzzlePoints);
            rounds[round.id].pointsDiv = puzzlePoints;

            if (0 && round.name !== "Ghosts") {
                paneDiv.css("display", "none");
            }
        });

        playerData.puzzles.forEach(function (puzzle) {
            pMap[puzzle.id] = puzzle;
        });

        console.log(rounds);
        playerData.puzzles.forEach(function (puzzle) {
            pMap[puzzle.id] = puzzle;
            puzzle.requiredPuzzles.filter(function (rp) {
                return pMap[rp.id];
            }).forEach(function (rp) {
                var points = [puzzle].concat(rp.points).concat([pMap[rp.id]]);


                var thickness = 10;
                var color = rp.color ? rp.color : "black";
                for (var i = 0; i < points.length - 1; i++) {
                    var a = points[i], b = points[i + 1];
                    var x1 = a.xCor, y1 = a.yCor, x2 = b.xCor, y2 = b.yCor;
                    var angle = Math.atan2((y1 - y2), (x1 - x2)) * (180 / Math.PI);
                    var length = Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));

                    var l = $("<div  style='position: absolute; background-color: " + color + "'>");
                    l.css("transform", "rotate(" + angle + "deg)");
                    l.css("-ms-transform", "rotate(" + angle + "deg)");
                    l.css("-webkit-transform", "rotate(" + angle + "deg)");
                    l.css("height", thickness + "px");
                    l.css("width", length + "px");
                    l.css("top", ((y1 + y2) / 2 - thickness / 2) + "px");
                    l.css("left", ((x1 + x2) / 2 - length / 2) + "px");
                    rounds[puzzle.roundId].pointsDiv.append(l);
                    if (i + 2 < points.length) {
                        var c = $("<div style='position: absolute; width: " + (thickness) + "px; height: " + (thickness) + "px; background-color: " + color + "; border-radius: 50%' />");
                        c.css("top", (b.yCor - thickness / 2) + "px");
                        c.css("left", (b.xCor - thickness / 2) + "px");
                        rounds[puzzle.roundId].pointsDiv.append(c);
                    }
                }
            });
        });

        playerData.puzzles.forEach(function (puzzle) {
            var point = $("<div class='puzzlePoint' />");
            puzzlePoints.push(point);
            point.css("top", (puzzle.yCor - 15) + "px");
            point.css("left", (puzzle.xCor - 15) + "px");

            var solveable = false;

            if (puzzle.solved) {
                point.css("background-color", "green");
            } else if (!puzzle.requiredPuzzles.length || puzzle.requiredPuzzles.some(function (rp) {
                return pMap[rp.id] && pMap[rp.id].solved;
            })) {
                point.css("background-color", "yellow");
                solveable = true;
            }

            rounds[puzzle.roundId].pointsDiv.append(point);

            point.click(function (evt) {
                clearPanes();
                var pane = $("<div style='position: absolute; background-color: black; width: 300px; border: 1px solid white; padding: 5px 5px 5px 5px; z-index: 100' />");
                rounds[puzzle.roundId].pointsDiv.append(pane);

                var rw = rounds[puzzle.roundId].width;
                var rh = rounds[puzzle.roundId].height;
                pane.css(puzzle.yCor < (rh / 2) ? "top" : "bottom", (puzzle.yCor < (rh / 2) ? puzzle.yCor : rh - puzzle.yCor) + "px");
                pane.css(puzzle.xCor < (rw / 2) ? "left" : "right", (puzzle.xCor < (rw / 2) ? puzzle.xCor : rw - puzzle.xCor) + "px");
                removePanes.push(pane);
                pane.click(function (evt) {
                    evt.stopPropagation();
                });
                evt.stopPropagation();

                var timers = [];
                removeTimers.push(setInterval(function () {
                    timers.forEach(function (timer) {
                        var left = Math.max(0, timer.end - new Date().getTime()) / 1000;
                        if (left <= 0) {
                            timer.widget.text("Time Expired");
                            timer.widget.css("color", "red");
                        } else {
                            var pad = function (t) {
                                return t < 10 ? '0' + parseInt(t) : parseInt(t);
                            };

                            timer.widget.text("Time left:  " + pad((left / 3600) % 60) + ":" + pad((left / 60) % 60) + ":" + pad(left % 60));
                        }
                    });
                }, 25));

                console.log("puzzle", puzzle.solved);
                if (puzzle.solved) {
                    console.log("solved", puzzle);
                    var label = $("<label style='position: relative; color:green; font-size: 20px; text-align: center; top: 4px'></label>");
                    label.text(puzzle.name);
                    pane.append(label);

                    if (puzzle.solvedAccessor) {
                        var accessorUrl = "getResource?accessor=" + puzzle.solvedAccessor;
                        var introExtension = puzzle.solvedFilename.substr(puzzle.introFilename.lastIndexOf(".") + 1).toLowerCase();

                        if (introExtension === "pdf") {
                            var body = $("<object data='" + accessorUrl + "' style='width:100%; margin-top: 10px; margin-bottom: 3px; max-height: 200px; overflow-y: auto'/>");
                            var link = $("<div style='margin-bottom: 10px'><a style='color: #59A0E6' target=\"_blank\" href=\"" + accessorUrl + "\">Download</a></div>");
                            pane.append(body);
                            pane.append(link);
                        } else if (introExtension === "mp4") {
                            var body = $("<video style='width:100%; margin-top: 10px; margin-bottom: 3px; max-height: 200px; overflow-y: auto' controls><source src='" + accessorUrl + "' type='video/mp4' /></video>");
                            var link = $("<div style='margin-bottom: 10px'><a style='color: #59A0E6' target=\"_blank\" href=\"" + accessorUrl + "\">Download</a></div>");
                            pane.append(body);
                            pane.append(link);
                        } else {
                            body = $("<a target=\"_blank\" href=\"" + accessorUrl + "\"><img src=\"" + accessorUrl + "\" style='width:100%; margin-top: 10px; margin-bottom: 10px; max-height: 200px; overflow-y: auto'/></a>");
                            pane.append(body);
                        }
                    } else {
                        var label = $("<label style='width:100%; color:green; font-size: 64px; text-align: center; display: inline-block'>SOLVED</label>");
                        pane.append(label);
                    }

                    link = $("<div style='margin-bottom: 10px'><a style='color: #59A0E6' target=\"_blank\" href=\"" + "getResource?accessor=" + puzzle.introAccessor + "\">The Puzzle</a></div>");
                    pane.append(link);
                } else if (solveable) {
                    var label = $("<label style='position: relative; color:yellow; font-size: 20px; text-align: center; top: 4px'></label>");
                    label.text(puzzle.name);
                    pane.append(label);

                    if (puzzle.started) {
                        if (puzzle.timeLimit) {
                            var endTime = puzzle.timeLimit * 1000 + puzzle.startTime;
                            console.log(new Date().getTime(), endTime);

                            var ends = $("<div style='margin-top: 5px'></div>");
                            var endLab = $("<label style='color: white; font-size: 18px; margin: auto; width: 100%'>Time Limit Expired!</label>");
                            ends.append(endLab);
                            timers.push({widget: endLab, end: endTime});

                            pane.append(ends);
                        }

                        var accessorUrl = "getResource?accessor=" + puzzle.introAccessor;
                        var introExtension = puzzle.introFilename.substr(puzzle.introFilename.lastIndexOf(".") + 1).toLowerCase();

                        if (introExtension === "pdf") {
                            var body = $("<object data='" + accessorUrl + "' style='width:100%; margin-top: 10px; margin-bottom: 3px; max-height: 200px; overflow-y: auto'/>");
                            var link = $("<div style='margin-bottom: 10px'><a style='color: #59A0E6' target=\"_blank\" href=\"" + accessorUrl + "\">Download</a></div>");
                            pane.append(body);
                            pane.append(link);
                        } else if (introExtension === "mp4") {
                            var body = $("<video style='width:100%; margin-top: 10px; margin-bottom: 3px; max-height: 200px; overflow-y: auto' controls><source src='" + accessorUrl + "' type='video/mp4' /></video>");
                            var link = $("<div style='margin-bottom: 10px'><a style='color: #59A0E6' target=\"_blank\" href=\"" + accessorUrl + "\">Download</a></div>");
                            pane.append(body);
                            pane.append(link);
                        } else {
                            body = $("<a target=\"_blank\" href=\"" + accessorUrl + "\"><img src=\"" + accessorUrl + "\" style='width:100%; margin-top: 10px; margin-bottom: 10px; max-height: 200px; overflow-y: auto'/></a>");
                            pane.append(body);
                        }

                        pane.append($("<span style='margin-right: 15px'><label style='color: white; font-size: 14px'>Solve</label></span>"));
                        var solveEntry = $("<input type='text' style='width: 245px' placeholder='Type the solution then press <Enter>' />");
                        pane.append(solveEntry);

                        var statusDiv = $("<div style='position: relative; height: 20px; margin-top: 10px; margin-bottom: 5px; overflow-y: auto; background-color: #444444'/>");
                        pane.append(statusDiv);

                        var statusLabel = $("<label style='color: white;  display: inline-block'>Awaiting input...</label>");
                        statusDiv.append(statusLabel);

                        solveEntry.keydown(function (evt) {
                            if (evt.key === "Enter") {
                                if (!solveEntry.val().length) {
                                    statusLabel.text("Awaiting input...");
                                    return;
                                }

                                statusLabel.text("Checking..");
                                $.post("checkPuzzle", {id: puzzle.id, solution: solveEntry.val()}, function (data) {
                                    console.log(data);
                                    if (data.solved) {
                                        reloadMap(puzzle.id)
                                    } else {
                                        statusLabel.text(data.message);
                                    }
                                });
                            }
                        });

                        var hintDiv = $("<div style='position: relative;  margin-top: 10px; margin-bottom: 5px; margin-right: 8px'>");
                        pane.append(hintDiv);
                        var hintLink = $("<label style='color: #59A0E6; text-decoration: underline; cursor: pointer; text-align: end; display: block'>Need a hint?</label>");
                        hintDiv.append(hintLink);
                        hintLink.click(function () {
                            showHintDialog(puzzle.id, puzzle.name);
                        });
                    } else {
                        var label = $("<label style='position: relative; color:white; font-size: 16px; text-align: center'></label>");
                        label.text("This is a timed puzzle. You have " + (puzzle.timeLimit / 60) + " minutes to solve it. You should gather your whole team!");
                        var labDiv = $("<div style='position: relative; margin-top: 10px'>");
                        labDiv.append(label);
                        pane.append(labDiv);

                        var startBtn = $("<label style='cursor: pointer; color: white; margin-top: 10px; color: lightgreen'>Ok, start!</label>");
                        pane.append(startBtn);
                        startBtn.click(function () {
                            showConfirmDialog("Are you sure? You'll have " + (puzzle.timeLimit / 60) + " minutes to solve it. Gather your whole team!", "Start!", "Cancel", function () {
                                $.post("startTimedPuzzle", {id: puzzle.id}, function (data) {
                                    reloadMap(puzzle.id);
                                });
                            });
                        });
                    }

                } else {
                    var label = $("<label style='width:100%; color:red; font-size: 64px; text-align: center; display: inline-block'>LOCKED</label>");
                    pane.append(label);
                }
            });
            if (openPuzzleId === puzzle.id) {
                console.log('hi');
                point.click();
            }
        });
    });
}



$(document).ready(function () {

    $(document).click(clearPanes);
    $("#modal").click(function (event) {
        event.stopPropagation();
    });
    reloadMap();
});

