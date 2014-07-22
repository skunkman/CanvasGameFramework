"use strict";

//Canvas board creation with tile setter, start, and stop
//boardId - ID of the canvas element
//refreshSpeed - Frames per second for canvas
function GameBoard(boardId, refreshSpeed) {
    var mainBoard = document.getElementById(boardId),
        mainContext = mainBoard.getContext("2d"),
        spriteObjects = {},
        canvasInterval;

    //Game board configurations
    mainBoard.width = window.innerWidth;
    mainBoard.height = window.innerHeight;

    //Adds to the spriteObjects object
    this.setSpriteObjects = function (tile, loc) {
        spriteObjects[loc] = tile;
    };

    //Starts the canvas interval and takes a callback function for its argument
    this.start = function (callback) {
        canvasInterval = setInterval(function () {
            var i;
            mainContext.clearRect(0, 0, mainBoard.width, mainBoard.height);
            for (i in spriteObjects) {
                mainContext.drawImage(spriteObjects[i].sprite, spriteObjects[i].spriteX, spriteObjects[i].spriteY, spriteObjects[i].spriteSizeX, spriteObjects[i].spriteSizeY, spriteObjects[i].locX, spriteObjects[i].locY, spriteObjects[i].spriteSizeX, spriteObjects[i].spriteSizeY);
            }
            if (callback) {
                callback();
            }
        }, 1000 / refreshSpeed);
    };

    this.stop = function () {
        clearInterval(canvasInterval);
    };
}

//Builds sprites to add to the tile object
GameBoard.prototype.buildSprite = function (spriteObj) {
    var image = new Image();
    image.src = spriteObj.img;
    return {
        sprite: image,
        spriteX: spriteObj.spriteX || 0,
        spriteY: spriteObj.spriteY || 0,
        spriteSizeX: spriteObj.spriteSizeX || 64,
        spriteSizeY: spriteObj.spriteSizeY || 64,
        locX: spriteObj.locX || 0,
        locY: spriteObj.locY || 0,
        collider: spriteObj.collider || {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            hit: function () {
                //This function will be fixed in a later update
                //For right now, it's like an "abstract class" method
            }
        }
    };
};

//Generic game mechanics - extends the GameBoard object
//boardId - ID of the canvas element
//refreshSpeed - Frames per second for canvas
function GameMechanics(boardId, refreshSpeed) {
    GameBoard.call(this, boardId, refreshSpeed);
    var score = 0,
        actions = {
            any: []
        };
    //Set up action subscriptions
    this.setAction = function (actionFunction, actionType) {
        var actionType = actionType || "any";
        if (typeof actions[actionType] === "undefined") {
            actions[actionType] = [];
        }
        actions[actionType].push(actionFunction);
    };

    //Removes an action subscription
    this.removeAction = function (actionFunction, actionType) {
        var actionType = actionType || "any",
            actionSubscribers = actions[actionType],
            i = actionSubscribers.length;
        for (; i-- > 0;) {
            if (actionSubscribers[i] === actionFunction) {
                actionSubscribers.splice(i, 1);
            }
        }
    };

    //Run action subscriptions (publish)
    this.runAction = function (funcArguments, actionType) {
        var actionType = actionType || "any",
            actionSubscribers = actions[actionType],
            i = actionSubscribers.length;
        for (; i-- > 0;) {
            actionSubscribers[i](funcArguments);
        }
    };

    this.incrementScore = function () {
        score++;
    };

    this.getScore = function () {
        return score;
    };
}

GameMechanics.prototype = Object.create(GameBoard.prototype);
GameMechanics.prototype.constructor = GameMechanics;

//Sets up the movement for the player object(s)
GameMechanics.prototype.playerMove = function (eventCallDown, eventCallUp) {
    document.addEventListener("keydown", eventCallDown);
    document.addEventListener("keyup", eventCallUp);
};

//Detects collision between objects
GameMechanics.prototype.collisionDetect = function (objectMoving, collisionToCheck) {
    var objCollider = objectMoving.collider,
        checkCollider = collisionToCheck.collider;
    if (objectMoving.locX - (objectMoving.spriteSizeX - objCollider.left) < collisionToCheck.locX - checkCollider.right &&
            objectMoving.locX + (objectMoving.spriteSizeX - objCollider.right) > collisionToCheck.locX - checkCollider.left &&
            objectMoving.locY - (objectMoving.spriteSizeY - objCollider.top) < collisionToCheck.locY - checkCollider.bottom &&
            objectMoving.locY + (objectMoving.spriteSizeY - objCollider.bottom) > collisionToCheck.locY - checkCollider.top) {
        objCollider.hit();
    }
};