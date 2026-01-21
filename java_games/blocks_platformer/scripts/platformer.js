//import {EXTERNAL_GAME_LEVELS} from "./levels.js";
var GAME_LEVELS = EXTERNAL_GAME_LEVELS;

class Level {
  constructor(plan) {
    let rows = plan.trim().split("\n").map(l => [...l]);
    this.height = rows.length;
    this.width = rows[0].length;
    this.startActors = [];

    this.rows = rows.map((row, y) => {
      return row.map((ch, x) => {
        let type = levelChars[ch];
        if (typeof type != "string" && type != null) {
          let pos = new Vec(x, y);
          this.startActors.push(type.create(pos, ch));
          type = "empty";
        }
        return type;
      });
    });
  }

  touches(pos, size, type) {
    let xStart = Math.floor(pos.x);
    let xEnd = Math.ceil(pos.x + size.x);
    let yStart = Math.floor(pos.y);
    let yEnd = Math.ceil(pos.y + size.y);

    for (let y = yStart; y < yEnd; y++) {
      for (let x = xStart; x < xEnd; x++) {
        let isOutside = x < 0 || x >= this.width ||
          y < 0 || y >= this.height;
        let here = isOutside ? "wall" : this.rows[y][x];
        if (here == type) return true;
      }
    }
    return false;
  };
}

class State {
  constructor(level, actors, status) {
    this.level = level;
    this.actors = actors;
    this.status = status;
    this.coinsCollected = 0;
  }

  static start(level) {
    return new State(level, level.startActors, "playing");
  }

  get player() {
    return this.actors.find(a => a.type == "player");
  }

  update(time, keys) {
    this.actors = this.actors
      .map(actor => actor.update(time, this, keys));
    //let newState = new State(this.level, actors, this.status);

    if (this.status != "playing") return this;

    let player = this.player;
    if (this.level.touches(player.pos, player.size, "lava")) {
      this.status = "lost";
      return this;
      return new State(this.level, actors, "lost");
    }

    for (let actor of this.actors) {
      if (actor != player && overlap(actor, player)) {
        actor.collide(this);
      }
    }

    if (this.coinsCollected > 0)
      changeButtonToolbox(Player.codeButton, ["xSpeed", "ySpeed", "size", "gravity"]);

    if (this.coinsCollected > 0)
      changeButtonToolbox(Player.codeButton, ["xSpeed", "ySpeed", "size", "gravity"]);

    return this;
  };
}

class Vec {
  constructor(x, y) {
    this.x = x; this.y = y;
  }
  plus(other) {
    return new Vec(this.x + other.x, this.y + other.y);
  }
  times(factor) {
    return new Vec(this.x * factor, this.y * factor);
  }
  equals(other) {
    if (other == null) {return false}
    return (this.x == other.x && this.y == other.y);
  }
}

function setup_player_code() {
  let toolbox = ["xSpeed", "ySpeed"];
  Player.codeButton = createCodeButton("Player", codeButtonsTray, toolbox);
  Player.codeButton.addEventListener('click', pause);
  Player.codeButton.workspaceSave = {
    "blocks": { "languageVersion": 0,
      "blocks": [
        {
          "type": "event_left_pressed",
          "x": 40, "y": 150,
          "deletable": false,
          "next": {
            "block": {
              "type": "xSpeed",
              "fields": {"speed": -10}
            }
          }
        },
        {
          "type": "event_right_pressed",
          "x": 40, "y": 250,
          "deletable": false,
          "next": {
            "block": {
              "type": "xSpeed",
              "fields": {"speed": 0}
            }
          }
        },
        {
          "type": "func_jump",
          "x": 40, "y": 350,
          "deletable": false,
          "next": {
            "block": {
              "type": "ySpeed",
              "fields": {"speed": -8}
            }
          }
        }
      ]
    }
  };
  generateButtonCodeFromWorkspace(Player.codeButton);
}

const gravity = 28;
const jumpSpeed = 17;

class Player {
  constructor(pos, speed) {
    this.pos = pos;
    this.speed = speed;
    this.xSpeed = 0;
    this.ySpeed = 0;
    this.sizeFactor = 1;
    this.defaultSize = new Vec(1, 1.5);
    this.size = this.defaultSize.times(this.sizeFactor);
    this.gravity = gravity;
  }

  static codeButton = null;

  get type() { return "player"; }

  static create(pos) {
    return new Player(pos.plus(new Vec(0, -0.5)),
      new Vec(0, 0));
  }

  update(time, state, keys) {
    runEvent(Player.codeButton, "event_update", this);

    //Scale the player without colliding:
    this.sizeFactor = Math.max(this.sizeFactor, 0.1);
    let oldSize = new Vec(this.size.x, this.size.y);
    this.size = this.defaultSize.times(this.sizeFactor);
    if (this.size.equals(oldSize) == false) {
      let bottomLeftOrigin = this.pos.plus(new Vec(0, oldSize.y - this.size.y));
      let bottomRightOrigin = this.pos.plus(new Vec(oldSize.x - this.size.x, oldSize.y - this.size.y));
      if (!state.level.touches(bottomLeftOrigin, this.size, "wall")) {
        this.pos = bottomLeftOrigin;
      } else if (!state.level.touches(bottomRightOrigin, this.size, "wall")) {
        this.pos = bottomRightOrigin;
      } else if (state.level.touches(this.pos, this.size, "wall")) {
        this.size = oldSize;
      }
    }

    //Horizontal input:
    this.xSpeed = 0;
    this.codeButton
    if (keys.ArrowLeft) {
      runEvent(Player.codeButton, "event_left_pressed", this);
    }
    if (keys.ArrowRight) {
      runEvent(Player.codeButton, "event_right_pressed", this);
    }

    //Horizontal (x) movement:
    let pos = this.pos;
    let xDelta = Math.min(Math.max(this.xSpeed * time, -0.99), 0.99);
    let newPos = pos.plus(new Vec(xDelta, 0));
    if (state.level.touches(newPos, this.size, "wall")) {
      //If collision with a wall (after x/horizontal movement):
      let collisionX = 0;
      if (this.xSpeed > 0) {
        collisionX = Math.floor(newPos.x + this.size.x) - this.size.x;
      } else {
        collisionX = Math.ceil(newPos.x);
      }
      newPos.x = collisionX;
    }
    
    //Vertical (y) movement:
    pos = newPos;
    this.ySpeed = this.speed.y + time * this.gravity;
    let yDelta = Math.min(Math.max(this.ySpeed * time, -0.99), 0.99);
    //console.log("xDelta = " + xDelta + ", yDelta = " + yDelta);
    newPos = pos.plus(new Vec(0, yDelta));
    if (state.level.touches(newPos, this.size, "wall")) {
      //If collision with a wall (after y/vertical movement):
      let collisionY = 0;
      if (this.ySpeed > 0) {
        collisionY = Math.floor(newPos.y + this.size.y) - this.size.y;
      } else {
        collisionY = Math.ceil(newPos.y);
      }
      newPos.y = collisionY;
      //Jump (up key pressed)
      if (keys.ArrowUp && Math.sign(this.ySpeed) == Math.sign(this.gravity)) {
        runEvent(Player.codeButton, "func_jump", this);
      } else {
        this.ySpeed = 0;
      }
    }
    pos = newPos;
    this.pos = pos;
    this.speed = new Vec(this.xSpeed, this.ySpeed);
    return this;
  };
}

class Lava {
  constructor(pos, speed, reset) {
    this.pos = pos;
    this.speed = speed;
    this.reset = reset;
    this.size = new Vec(1, 1);
  }

  get type() { return "lava"; }

  static create(pos, ch) {
    if (ch == "=") {
      return new Lava(pos, new Vec(2, 0));
    } else if (ch == "|") {
      return new Lava(pos, new Vec(0, 2));
    } else if (ch == "v") {
      return new Lava(pos, new Vec(0, 3), pos);
    }
  }

  update(time, state) {
    if (this.speed.x == 0 && this.speed.y == 0) {
      return this;
    }
    let newPos = this.pos.plus(this.speed.times(time));
    if (!state.level.touches(newPos, this.size, "wall")) {
      this.pos = newPos;
    } else if (this.reset) {
      this.pos = this.reset;
    } else {
      this.speed = this.speed.times(-1);
    }
    return this;
  };

  collide(state) {
    state.status = "lost";
  };
}

function setup_button_code() {
  let toolbox = ["moveXY"];
  Button.codeButton = createCodeButton("Buttons", codeButtonsTray, toolbox);
  Button.codeButton.addEventListener('click', pause);
  Button.codeButton.workspaceSave = {
    "blocks": { "languageVersion": 0,
      "blocks": [
        {
          "type": "event_btn_red_pressed",
          "x": 40, "y": 50,
          "deletable": false,
        },
        {
          "type": "event_btn_green_pressed",
          "x": 40, "y": 150,
          "deletable": false,
        },
        {
          "type": "event_btn_blue_pressed",
          "x": 40, "y": 250,
          "deletable": false,
        }
      ]
    }
  };
  generateButtonCodeFromWorkspace(Button.codeButton);
}

class Button {
  constructor(pos, col) {
    this.normalPos = pos;
    this.pos = pos;
    this.col = col;
    this.size = new Vec(0.8, 0.2);
    this.pressed = false;
    this.target = this;
  }

  get type() { return "btn_" + this.col; }

  static create(pos, ch) {
    let basePos = pos.plus(new Vec(0.1, 0.8));
    if (ch == "G") {
      return new Button(basePos, "green");
    } else if (ch == "B") {
      return new Button(basePos, "blue");
    } else if (ch == "R") {
      return new Button(basePos, "red");
    }
  }

  update(time, state) {
    if (this.pressed) {
      this.size = new Vec(0.8, 0.05);
      this.pos = this.normalPos.plus(new Vec(0, 0.15));
      this.pressed = false;
      if (this.target != null)
        runEvent(Button.codeButton, "event_"+this.type+"_pressed", this.target)
    } else {
      this.size = new Vec(0.8, 0.2);
      this.pos = this.normalPos;
    }
    return this;
  };

  collide(state) {
    //Trigger button HERE
    this.pressed = true;
  };
}

class Coin {
  constructor(pos, basePos, wobble) {
    this.pos = pos;
    this.basePos = basePos;
    this.wobble = wobble;
    this.size = new Vec(0.6, 0.6);
  }

  get type() { return "coin"; }

  static create(pos) {
    let basePos = pos.plus(new Vec(0.2, 0.1));
    return new Coin(basePos, basePos,
      Math.random() * Math.PI * 2);
  }

  collide(state) {
    let filtered = state.actors.filter(a => a != this);
    state.actors = filtered;
    state.coinsCollected += 1;
    let status = state.status;
    if (!filtered.some(a => a.type == "coin")) status = "won";
    state.status = status;
  };

  update = function (time) {
    let wobble = this.wobble + time * wobbleSpeed;
    let wobblePos = Math.sin(wobble) * wobbleDist;
    return new Coin(this.basePos.plus(new Vec(0, wobblePos)),
      this.basePos, wobble);
  };
}
const wobbleSpeed = 8, wobbleDist = 0.07;

Coin.prototype.size = new Vec(0.6, 0.6);

const levelChars = {
  ".": "empty", "#": "wall", "+": "lava",
  "@": Player, "o": Coin,
  "=": Lava, "|": Lava, "v": Lava,
  "R": Button, "G": Button, "B": Button,
};

let simpleLevelPlan = `
......................
..#................#..
..#..............=.#..
..#.........o.o....#..
..#.@......#####...#..
..#####............#..
......#++++++++++++#..
......##############..
......................`;

//let simpleLevel = new Level(simpleLevelPlan);

function elt(name, attributesDict, ...children) {
  let dom = document.createElement(name);
  for (let attr of Object.keys(attributesDict)) {
    dom.setAttribute(attr, attributesDict[attr]);
  }
  for (let child of children) {
    dom.appendChild(child);
  }
  return dom;
}

class DOMDisplay {
  constructor(parent, level) {
    this.dom = elt("div", { class: "game" }, drawGrid(level));
    this.actorLayer = null;
    parent.appendChild(this.dom);
  }

  clear() { this.dom.remove(); }

  syncState(state) {
    if (this.actorLayer) this.actorLayer.remove();
    this.actorLayer = drawActors(state.actors);
    this.dom.appendChild(this.actorLayer);
    this.dom.className = `game ${state.status}`;
    this.scrollPlayerIntoView(state);
  };

  scrollPlayerIntoView(state) {
    let width = this.dom.clientWidth;
    let height = this.dom.clientHeight;
    let margin = width / 3;

    // The viewport
    let left = this.dom.scrollLeft, right = left + width;
    let top = this.dom.scrollTop, bottom = top + height;

    let player = state.player;
    let center = player.pos.plus(player.size.times(0.5))
      .times(scale);

    if (center.x < left + margin) {
      this.dom.scrollLeft = center.x - margin;
    } else if (center.x > right - margin) {
      this.dom.scrollLeft = center.x + margin - width;
    }
    if (center.y < top + margin) {
      this.dom.scrollTop = center.y - margin;
    } else if (center.y > bottom - margin) {
      this.dom.scrollTop = center.y + margin - height;
    }
  };
}

const scale = 20;

function drawGrid(level) {
  //console.log(`${level.width} by ${level.height}`);
  return elt("table", {
    class: "background",
    style: `width: ${level.width * scale}px`
  }, ...level.rows.map(row =>
    elt("tr", { style: `height: ${scale}px` },
      ...row.map(type => elt("td", { class: type, style: `width: ${scale}px` })))
  ));
}

function drawActors(actors) {
  return elt("div", {}, ...actors.map(actor => {
    let rect = elt("div", { class: `actor ${actor.type}` });
    rect.style.width = `${actor.size.x * scale}px`;
    rect.style.height = `${actor.size.y * scale}px`;
    rect.style.left = `${actor.pos.x * scale}px`;
    rect.style.top = `${actor.pos.y * scale}px`;
    return rect;
  }));
}

function overlap(actor1, actor2) {
  return actor1.pos.x + actor1.size.x > actor2.pos.x &&
    actor1.pos.x < actor2.pos.x + actor2.size.x &&
    actor1.pos.y + actor1.size.y > actor2.pos.y &&
    actor1.pos.y < actor2.pos.y + actor2.size.y;
}

function trackKeys(keys) {
  let down = Object.create(null);
  function track(event) {
    if (keys.includes(event.key)) {
      down[event.key] = event.type == "keydown";
      if (paused)
        return;
      event.preventDefault();
    }
  }
  window.addEventListener("keydown", track);
  window.addEventListener("keyup", track);
  return down;
}

function stopTrackingKeys(keys) {
  window.removeEventListener("keydown", track);
  window.removeEventListener("keyup", track);
}

const inputKeys = trackKeys(["ArrowLeft", "ArrowRight", "ArrowUp", "Escape"]);
let paused = false;

function addSaveEvents() {
  document.querySelector('#save').addEventListener('click', unpause);
}

function pause() {
  paused = true;
}

function unpause() {
  paused = false;
}


function runAnimation(frameFunc) {
  let lastTime = null;
  function frame(time) {
    if (lastTime != null) {
      let timeStep = Math.min(time - lastTime, 100) / 1000;
      if (frameFunc(timeStep) === false) return;
    }
    lastTime = time;
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}


function runLevel(level, Display) {
  let platformerDiv = document.getElementById("platformer")
  let display = new Display(platformerDiv, level);
  let state = State.start(level);
  let ending = 1;
  return new Promise(resolve => {
    runAnimation(time => {
      if (paused == false)
        state = state.update(time, inputKeys);
      display.syncState(state);
      if (state.status == "playing") {
        return true;
      } else if (ending > 0) {
        //stopTrackingKeys(); TODO:HERE
        ending -= time;
        return true;
      } else {
        display.clear();
        resolve(state.status);
        return false;
      }
    });
  });
}


async function runGame(plans, Display) {
  for (let level = 0; level < plans.length;) {
    let status = await runLevel(new Level(plans[level]),
      Display);
    if (status == "won") level++;
  }
  console.log("You've won!");
}


document.addEventListener("DOMContentLoaded", () => {
  setupBlockly();
  addSaveEvents();
  setup_player_code();
  //setup_button_code();
  runGame(GAME_LEVELS, DOMDisplay);
})