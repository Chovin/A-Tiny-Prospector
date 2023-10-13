"use strict";

const GRADIENT = "$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\|()1{}[]?-_+~<>i!lI;:,\"^`'. "
const gridFontSize = 36
var monoFont;
var seed;
var muns = 0
var WHITE;
var WWHITE;
var LIGHT_GREY;
var GREY;
var MID_GREY;
var DARK_GREY;
var YELLOW;
var ORANGE;
var BROWN;
var SKYBLUE;
var SSKYBLUE;
var TEAL;
var RED;
var MRED;
var DRED;
var PINK;
var PURPLE;
var BLUE;
var DARK_BLUE;
var STONE;
var OBSIDIAN;
var DARK;
var BACKGROUND;
var STONE_AT = 32;
var DEEP_AT = STONE_AT + 18;
var yratio;
var world;
var board;
var cam;
var mouseJustPressed = false;
var mouseLetGo = true;
var shake;
var palette;
var munsUp = 0;
var titleHeight = 70
var upgradeHeight = 150
var munFlashPal;
var munFlashTimes = [

]
var munAddPopup;
var OpalPal;
var RubyPal;
var DiamondPal;
var ChestPal;
var treasures;
var tools;
var notifications;
var title = 'a tiny prospector.'
var titleX;
var titleY;
var wagon;
var pickaxe;
var upgrades;
var titleNotify;
var hasWagon = false;
var pickLvl = 0;
var pickNames = [
  '',
  'a pickaxe',
  'an EPICkaxe'
]
var toolPhrases = [
  'scorches the earth.',
  'shapes the earth.',
  ' a tiny prospector, eater of worlds.'
]
var toolTitleReplace = [false, false, true]
var restartTimer;
var restartWaitTime = 60;
var restartPressedTimes;
var memoryCard;
var frameRateT = 0
var frameRateTimer = 450
var frameTryAgainTime = 450
var slowDown = false
var saveEvery = 50
var saveCounter = 0
var upgradeStartingCosts = [
  300,
  30 / 4,
  200,
  1337
]
var upgradeCostMults = [4, 4, 3.5, 3.5]
var toolMins = [0, STONE_AT, STONE_AT + (DEEP_AT - STONE_AT) / 2]
var toolMaxs = [STONE_AT, DEEP_AT, GRADIENT.length + 1]
var treasuresSave = {}
var proportions = {
  'opal': .06,
  'ruby': .04,
  'diamond': .03,
  'chest': .01,
}
// proportions = {
//   'opal': .0001,
//   'ruby': .0001,
//   'diamond': .0001,
//   'chest': .0001,
// }
var chestFound
var chestFoundReached
var dugAll
var dugAllNeeded = 40
var dugAllReached
var prevMs
var cht
var death
var deathT
var deathRestartT = 350
var gatewayShape = [
  0, 1, 1, 1, 1, 1, 1, 0,
  1, 1, 1, 1, 1, 1, 1, 1,
  1, 1, 1, 1, 1, 1, 1, 1,
  1, 1, 1, 1, 1, 1, 1, 1,
  0, 1, 1, 1, 1, 1, 1, 0,
]
var munges = [
  'death',
  'snum',
  'blood',
  'dead',
  'rots',
  'ROT',
  'flesh',
  'sins',
  'DIE',
  'FREE',
  'KILL',
  'ALL',
  'SHALL'
]
var dmungeT
var dmunge = false
var dumngeN = 0
var endPal
var noiseStart
var pants
var fetchp
var firstMuns

var startScreen = true
var sst = 0
var sstThreshMult = .75
var startPressed = false

var audio = false;
var justStarted = true;
var mainTheme;

// TODO
// noise hints towards gateway

class Serialize {
  constructor() {
    this.dirts = []
    this.gids = {}
  }
  setup() {
    let sw = this.dirts
    let gids = this.gids
    for (let y = 0; y < world.rows; y++) {
      let row = []
      sw.push(row)
      for (let x = 0; x < world.cols; x++) {
        let dirt = world.get(x, y)
        let tp = dirt.topSoil ? -2 : -1
        tp = dirt.topSoil ? 1 : -1
        let depths = [tp * dirt.depth]
        // let depths = {tp: dirt.depth}
        // Object.entries(dirt._contents).forEach(([d, {item}]) => {
        //   let gid = item.gid || 0
        //   depths[d] = gid
        // });
        Object.entries(dirt._contents).forEach(([d, { item }]) => {
          if (!(~~item.gid)) {
            depths.push(~~d)
          } else if (!gids[~~item.gid]) {
            gids[~~item.gid] = [~~x, ~~y, ~~d]
          }
        });
        row.push(depths)
      }
    }
    // console.log('gids', gids, this.gids)
  }
  linkUpdate(dirt, x, y) {
    self = this
    return (bury, depth) => {
      if (bury) {
        let id = self.dirts[y][x][0]
        let buried = self.dirts[y][x].slice(1)
        if (!buried.includes(depth)) {
          self.dirts[y][x].push(depth)
        }
      } else {
        let tp = dirt.topSoil ? 1 : -1
        self.dirts[y][x][0] = tp * dirt.depth;
      }
    }
  }
  save() {
    console.log('saving')
    let sw = this.dirts
    let gids = this.gids
    let opals = []
    let rubies = []
    let diamonds = []
    let chests = []
    let gateX = treasuresSave[1][1]
    let gateY = treasuresSave[1][2]

    Object.entries(treasuresSave).forEach(([gid, [treasure, x, y, depth]]) => {
      let pack = [~~gid, x, y, depth]
      if (treasure instanceof Chest) {
        chests.push(pack)
      } else if (treasure instanceof Diamond) {
        diamonds.push(pack)
      } else if (treasure instanceof Ruby) {
        rubies.push(pack)
      } else if (treasure instanceof Opal) {
        opals.push(pack)
      }
    })
    // console.log('treasures', treasures)
    let pkg = [
      upgrades.map(upg => {
        return upg.lvl
      }),
      ~~cam.x, ~~cam.y,
      muns,
      sw,
      opals,
      rubies,
      diamonds,
      chests,
      dugAll,
      chestFound,
      gateX,
      gateY,
      wagon.x,
      wagon.y,
      cht ? 1 : 0
    ]
    storeItem('pkg', pkg);
  }
  load() {
    let [upgs, camX, camY, mns, dirts, opals, rubies, diamonds, chests, da, cf, gx, gy, wx, wy, ch] = getItem('pkg')
    // console.log(getItem('pkg'))
    let costs = upgs.slice().map((lvl, i) => {
      let cost = upgradeStartingCosts[i]
      for (let l = 0; l < lvl; l++) {
        cost = ~~(cost * upgradeCostMults[i])
      }
      return cost
    })
    // console.log(upgs)
    let converted = false
    if (upgs[0] == 1) {
      wagon = new Wagon(0)
      wagon.buy(true)
    } else {
      wagon = new Wagon(costs[0])
      if (upgs[0] > 1) {
        converted = true
      }
    }
    costs = costs.slice(1)
    let syms = ['>', ')', '}']
    tools = costs.map((c, i) => {
      return new Tool(c, upgradeCostMults[i], upgs[i + 1], syms[i], toolMins[i], toolMaxs[i], i, toolPhrases[i], toolTitleReplace[i])
    })
    pickaxe = tools[1]
    if (!converted && pickaxe.lvl == pickaxe.maxLvl && wagon.lvl > 0) {
      wagon.convertUpgrade()
    } else if (converted) {
      wagon.convertUpgrade()
      for (let i = 1; i < upgs[0]; i++) {
        wagon.buy(true)
      }
      wagon.lvl += 1
      wagon.x = wx
      wagon.y = wy
    }


    upgrades = [wagon, ...tools]

    cam.x = camX
    cam.y = camY
    muns = mns
    chestFound = cf
    chestFoundReached = chestFound >= 1
    dugAll = da
    dugAllReached = dugAll >= dugAllNeeded
    treasures = {}
    treasuresSave = {}
    title = 'a tiny prospector.'
    cht = ch == 1

    // load dirt and coins
    world.grid = []
    for (let y = 0; y < world.rows; y++) {
      let row = []
      world.grid.push(row)
      for (let x = 0; x < world.cols; x++) {
        let dd = dirts[y][x]
        let depth = dd[0]
        let topSoil = depth >= 0
        depth = abs(depth)
        let dirt = new Dirt(depth, world.palette)
        dirt.topSoil = topSoil
        if (!topSoil) {
          dirt._resetColor(depth)
        }
        let coinDepths = dd.slice(1)
        let revealed = null
        // console.log(coinDepths)
        coinDepths.forEach((d) => {
          if (d >= depth) {
            let coin = new Coin()
            coin.t = random(12)
            if (d == depth) {
              dirt.depth -= 1
              dirt.exactBury(d, coin, 0)
              dirt.depth += 1
              dirt.revealed = { item: coin, position: 0 }
              coin.uncover()
            } else {
              dirt.exactBury(d, coin, 0)
            }
          }
        })
        dirt.link(this, x, y)
        row.push(dirt)
      }
    }
    let x = gx
    let y = gy
    let group = []
    let gi = 0
    let pi = 0
    let toUncover = []
    for (let yo = 0; yo < 5; yo++) {
      for (let xo = 0; xo < 8; xo++) {
        if (gatewayShape[gi] == 1) {
          let dirt = world.get(x + xo, y + yo)
          let depth = GRADIENT.length - 1
          let gate = new Gateway(pi, 1, x + 3.5, y + 2)
          gate.t = random(12)
          if (pi == 0) {
            treasuresSave[1] = [gate, x, y, depth]
          }
          group.push(dirt)
          let surface = depth == dirt.depth
          if (surface) {
            dirt.depth -= 1
            dirt.revealed = { item: gate, position: pi }
            toUncover.push(gate)
          }
          dirt.exactBury(depth, gate, pi)
          if (surface) { dirt.depth += 1 }
          pi += 1
        }
        gi += 1
      }
    }
    treasures[1] = group
    toUncover.forEach((obj) => {
      obj.uncover()
    })


    let parts = [2, 2, 2, 6]
    let classes = [Opal, Ruby, Diamond, Chest]
    let loadList = [opals, rubies, diamonds, chests]
    // console.log('load', loadList)
    loadList.forEach((lst, i) => {
      let cls = classes[i]
      let mp = parts[i]
      lst.forEach(([gid, x, y, d]) => {
        gid = ~~gid
        let failed = false
        let pn = 1
        for (let yo = 0; yo < 2; yo++) {
          for (let xo = 0; xo < 3; xo++) {
            if (pn > mp) {
              yo = 2
              break
            }
            let dirt = world.get(x + xo, y + yo)
            if (dirt._contents[d] || d < dirt.depth) {
              failed = true
              yo = 2
              break
            }
            pn += 1
          }
        }
        if (failed) {
          // console.log('failed')
        } else {
          let pn = 1
          let group = []
          let toUncover = []
          for (let yo = 0; yo < 2; yo++) {
            for (let xo = 0; xo < 3; xo++) {
              if (pn > mp) {
                yo = 2
                break
              }
              let dirt = world.get(x + xo, y + yo)
              let surface = d == dirt.depth
              let obj;
              if (surface) {
                dirt.depth -= 1
              }
              if (mp == 6) {
                obj = new cls(pn - 1, gid, x + 1, y + .5)
              } else {
                obj = new cls(pn - 1, gid)
              }
              obj.t = random(12)
              if (xo == 0 && yo == 0) {
                treasuresSave[gid] = [obj, x, y, d]
              }
              dirt.exactBury(d, obj, pn - 1)
              if (surface) {
                dirt.depth += 1
                dirt.revealed = { item: obj, position: pn - 1 }
                toUncover.push(obj)
              }
              group.push(dirt)
              pn += 1
            }
          }
          treasures[gid] = group
          toUncover.forEach((obj) => {
            obj.uncover()
          })
        }

      });
    })
    // go through dirt and reveal if needed
  }
}
class Notification {
  constructor(draw, lifetime, palette) {
    lifetime = lifetime || 60
    this.maxLife = lifetime
    this.life = lifetime
    this.pal = palette || [
      DARK_GREY,
      MID_GREY,
      GREY,
      GREY,
      GREY,
      GREY,
      GREY,
      GREY,
      GREY,
      GREY,
      MID_GREY,
      DARK_GREY,
      color(0, 0, 0, 0)
    ]
    this._draw = draw
    notifications.push(this)
  }
  draw() {
    this.life -= 1
    if (this.life < 0) {
      notifications.splice(notifications.indexOf(this), 1)
      return
    }
    let i = ~~map(this.life, this.maxLife - 1, 0, 0, this.pal.length - 1, true)
    // console.log(i)
    fill(this.pal[i])
    this._draw()
  }
}

class MunAddPopup {
  constructor(x, y) {
    this.x = x
    this.y = y
    this.t = 0
    this.color = GREY
    this.value = 0
  }
  popup(value, color, override) {
    override = override || false
    if (value >= this.value || override) {
      this.value = value
      this.t = 16
      this.color = color
    }
  }
  update() {
    this.t = max(this.t - 1, 0)
    if (this.t == 0) {
      this.value = 0
    } else if (this.t <= 4) {
      this.color = GREY
    }
  }
  draw(xOff, yOff) {
    xOff = xOff || 0
    yOff = yOff || 0
    if (this.t > 0) {
      fill(this.color)
      text(`+${this.value}`, this.x + xOff, this.y + yOff)
    }
  }
}


class Valuable {
  constructor(dirts) {
    this.t = 0
    this.symbol = '*'
    this.color = YELLOW
    this.value = 5
    this.allUncovered = false
    // can't be serialized
    // this.dirts = dirts
    this.flashColor = 1
  }
  update() { }
  uncover() { }
  collect() { }
}

class Coin extends Valuable {
  constructor() {
    super()
    this.frames = '0OO'
    this.symbol = this.frames[0]
    this.color = YELLOW
    this.value = 10
    this.flashColor = 5
  }
  update() {
    let animTime = 6
    this.t = (this.t + 1) % animTime
    let i = ~~map(this.t, 0, animTime, 0, this.frames.length)
    // print(i)
    this.symbol = this.frames[i]
  }
  uncover(position) {
    this.allUncovered = true
  }
  collect() {
    prevMs += this.value
    return this.value
  }
} // ( C | )  0 O
class Opal extends Valuable {
  constructor(i, gi) {
    super()
    this.id = i
    this.gid = ~~gi
    this.symbol = i == 0 ? '(' : ')'
    this.color = YELLOW
    this.colors = OpalPal
    this.value = ~~random(40, 60)
    this.uncovered = false
    this.flashColor = 9
  }
  update() {
    let animTime = 12
    this.t = (this.t + .4) % animTime
    let i = ~~map(this.t, 0, animTime, 0, this.colors.length)
    this.color = this.colors[i]
  }
  uncover(position) {
    this.uncovered = true
    let dirts = treasures[this.gid]
    let other = dirts[~~!this.id].revealed
    if (other && other.item.uncovered && other.item.gid == this.gid) {
      this.allUncovered = true
      other.item.allUncovered = true
    }
  }
  collect() {
    let dirts = treasures[this.gid]
    let odirt = dirts[~~!this.id]
    let depth = treasuresSave[this.gid][3]
    if (!odirt.revealed || odirt.revealed.item.gid != this.gid) {
      console.log('opal broken', odirt.revealed, odirt.depth, depth)
      odirt.depth = depth
      if (!odirt._contents[depth] || odirt._contents[depth].item.gid != this.gid) {
        console.log('opal piece missing')
        return this.value
      }
    }
    dirts[~~!this.id].dig()
    prevMs += this.value
    return this.value
  }
} // ()
class Ruby extends Valuable {
  constructor(i, gi) {
    super()
    this.id = i
    this.gid = ~~gi
    this.symbol = i == 0 ? '[' : ']'
    this.color = YELLOW
    this.colors = RubyPal
    this.value = ~~random(160, 240)
    this.uncovered = false
    this.flashColor = 12
  }
  update() {
    let animTime = 12
    this.t = (this.t + .4) % animTime
    let i = ~~map(this.t, 0, animTime, 0, this.colors.length)
    this.color = this.colors[i]
  }
  uncover(position) {
    this.uncovered = true
    let dirts = treasures[this.gid]
    let other = dirts[~~!this.id].revealed
    if (other && other.item.uncovered && other.item.gid == this.gid) {
      this.allUncovered = true
      other.item.allUncovered = true
    }
  }
  collect() {
    let dirts = treasures[this.gid]
    let odirt = dirts[~~!this.id]
    let depth = treasuresSave[this.gid][3]
    if (!odirt.revealed || odirt.revealed.item.gid != this.gid) {
      console.log('ruby broken', odirt.revealed, odirt.depth, depth)
      odirt.depth = depth
      if (!odirt._contents[depth] || odirt._contents[depth].item.gid != this.gid) {
        console.log('ruby piece missing')
        return this.value
      }
    }
    dirts[~~!this.id].dig()
    prevMs += this.value
    return this.value
  }
} // [] 200
class Diamond extends Valuable {
  constructor(i, gi) {
    super()
    this.id = i
    this.gid = ~~gi
    this.symbol = i == 0 ? '<' : '>'
    this.color = YELLOW
    this.colors = DiamondPal
    this.value = ~~random(900, 1100)
    this.uncovered = false
    this.flashColor = 16
  }
  update() {
    let animTime = 14
    this.t = (this.t + .7) % animTime
    let i = ~~map(this.t, 0, animTime, 0, this.colors.length)
    this.color = this.colors[i]
  }
  uncover(position) {
    this.uncovered = true
    let dirts = treasures[this.gid]
    let other = dirts[~~!this.id].revealed
    if (other && other.item.uncovered && other.item.gid == this.gid) {
      this.allUncovered = true
      other.item.allUncovered = true
    }
  }
  collect() {
    let dirts = treasures[this.gid]
    let odirt = dirts[~~!this.id]
    let depth = treasuresSave[this.gid][3]
    if (!odirt.revealed || odirt.revealed.item.gid != this.gid) {
      console.log('diamond broken', odirt.revealed, odirt.depth, depth)
      odirt.depth = depth
      if (!odirt._contents[depth] || odirt._contents[depth].item.gid != this.gid) {
        console.log('diamond piece missing')
        return this.value
      }
    }
    dirts[~~!this.id].dig()
    prevMs += this.value
    return this.value
  }
}
// /\ // <>  1000
// \/
class Chest extends Valuable {
  constructor(i, gi, centerX, centerY) {
    super()
    this.cx = centerX
    this.cy = centerY
    this.id = i
    this.gid = ~~gi
    let symbols = '=o=I_I'
    let latchPal = [YELLOW, YELLOW, YELLOW, WWHITE]
    let hingePal = [ORANGE, ORANGE, ORANGE, YELLOW]
    let boxPal = [BROWN, BROWN, BROWN, ORANGE]
    ChestPal = {
      0: hingePal,
      1: latchPal,
      2: hingePal,
      3: boxPal,
      4: boxPal,
      5: boxPal
    }
    this.symbol = symbols[i]
    this.color = YELLOW
    this.colors = ChestPal
    this.value = ~~random(4000, 8000)
    this.uncovered = false
    this.flashColor = 19
  }
  update() {
    let animTime = 8
    this.t = (this.t + .7) % animTime
    let colors = this.colors[this.id]
    let i = ~~map(this.t, 0, animTime, 0, colors.length)
    this.color = colors[i]
  }
  uncover(position) {
    this.uncovered = true
    // console.log(this.dirts)
    // console.log('uncover', this.gid, treasures[this.gid], treasures)
    let dirts = treasures[this.gid]
    for (let i = 0; i < dirts.length; i++) {
      let d = dirts[i].revealed
      if (!d || !d.item.uncovered || this.gid != d.item.gid) {
        return
      }
    }
    if (!this.allUncovered) {
      chestFound += 1
      if (chestFound == 1 && !chestFoundReached && notifications.length == 0) {
        chestFoundReached = true
        new Notification(
          () => {
            let s = 'finds buried treasure.'
            text(s, board.hpad + (~~(board.cols / 2 - (s.length - 1) / 2)) * (board.lw + board.lwp), titleY + board.lh + board.lhp * 7)
            fill(BACKGROUND)
            noStroke()
            if (title[title.length - 1] == '.') {
              rect(titleX + textWidth(title) - textWidth('.'), titleY + board.lhp, textWidth('.'), -(board.lh + board.lhp))
            }
          }, 80
        )
      }
    }
    // console.log('fully uncovered')
    for (let i = 0; i < dirts.length; i++) {
      let d = dirts[i].revealed
      d.item.allUncovered = true
    }
  }
  collect() {
    // console.log('collect')
    // for (let i=0; i<this.dirts.length; i++) {
    //   if (this.id == i) {
    //     continue
    //   }
    //   let d = this.dirts[i]
    //   d.dig()
    // }
    for (let i = 0; i < treasures[this.gid].length; i++) {
      let d = treasures[this.gid][i]
      // try to fix broken objs
      if (!d.revealed || d.revealed.item.gid != this.gid) {
        console.log('chest broken', d.revealed, d.depth, treasuresSave[this.gid][3])
        let depth = treasuresSave[this.gid][3]
        d.depth = depth
        if (!d._contents[depth] || d._contents[depth].item.gid != this.gid) {
          console.log('chest piece missing')
          continue
        }
        d.revealed = d._contents[depth]
      }
      if (d.revealed.item.id == this.id) {
        continue
      }
      d.dig()

    }

    for (let i = 0; i < 22; i++) {
      let x = ~~(this.cx + map(random(), 0, 1, -3.5, 3.5))
      let y = ~~(this.cy + map(random(), 0, 1, -3.5, 3.5))
      try {
        let d = world.get(x, y)
        d.bury(0, new Coin(), 0, true, true)
      } catch (error) {
      }
    }
    prevMs += this.value
    return this.value
  }
} // spews loot into dirt.revealed neighbors until x amount
// has been spewed. various items of diff value
// =o=
// I_I
//._____.
//|--v--|
//|_____|

//  \/\/\/
// \##@@##/
// \#@@@@#/
// \##@@##/
//  \/\/\/
class Gateway extends Valuable {
  constructor(i, gi, centerX, centerY) {
    super()
    this.cx = centerX
    this.cy = centerY
    this.id = i
    this.gid = ~~gi
    let ringPal = [RED, ORANGE, YELLOW, MRED, RED, MRED, ORANGE, RED, MRED]
    let midPal = [OBSIDIAN, DARK, DARK_BLUE, OBSIDIAN, OBSIDIAN, DARK, color(60, 50, 90), OBSIDIAN, DRED]
    let rimPal = [OBSIDIAN, DARK_BLUE, DARK, OBSIDIAN, MRED, DRED, color(60, 50, 90), OBSIDIAN, DRED]
    let ls = '\\\\\\^\\\\\\^\\/V\'\\\\\\\\\\  '
    let rs = '///^///^/\\V\'//////  '
    let os = '^^__~~%##%##%\'##'
    let is = '@@@O@@@O@@@O0o@'
    let pals = [
      ringPal, ringPal, ringPal, ringPal, ringPal, ringPal,
      ringPal, rimPal, rimPal, midPal, midPal, rimPal, rimPal, ringPal,
      ringPal, rimPal, midPal, midPal, midPal, midPal, rimPal, ringPal,
      ringPal, rimPal, rimPal, midPal, midPal, rimPal, rimPal, ringPal,
      ringPal, ringPal, ringPal, ringPal, ringPal, ringPal,
    ]
    this.symbolsList = [
      ls, rs, ls, rs, ls, rs,
      ls, os, os, is, is, os, os, rs,
      ls, os, is, is, is, is, os, rs,
      ls, os, os, is, is, os, os, rs,
      ls, rs, ls, rs, ls, rs,
    ]
    this.symbols = this.symbolsList[i]
    this.symbol = ' '
    this.color = YELLOW
    this.colors = pals
    this.value = -random(50000000000000000000000, 90000000000000000000000)
    this.uncovered = false
    this.flashColor = 19
  }
  update() {
    let animTime = 50
    this.t = (this.t + .7) % animTime
    let colors = this.colors[this.id]
    let i = ~~map(this.t, 0, animTime, 0, colors.length)
    this.color = colors[i]
    let sat = this.t & animTime * .4 + animTime * random(.2)
    i = ~~map(sat, 0, animTime * .6, 0, this.symbols.length)
    this.symbol = this.symbols[i]
  }
  uncover(position) {
    this.uncovered = true
    // console.log(this.dirts)
    // console.log('uncover', this.gid, treasures[this.gid], treasures)
    let dirts = treasures[this.gid]
    for (let i = 0; i < dirts.length; i++) {
      let d = dirts[i].revealed
      if (!d || !d.item.uncovered || this.gid != d.item.gid) {
        return
      }
    }
    // console.log('fully uncovered')
    for (let i = 0; i < dirts.length; i++) {
      let d = dirts[i].revealed
      d.item.allUncovered = true
    }
  }
  collect() {
    // console.log('collect')
    // for (let i=0; i<this.dirts.length; i++) {
    //   if (this.id == i) {
    //     continue
    //   }
    //   let d = this.dirts[i]
    //   d.dig()
    // }
    // for (let i=0;i<treasures[this.gid].length;i++) {
    //   let d = treasures[this.gid][i]
    //   if (d.revealed.item.id == this.id) {
    //     continue
    //   }
    //   // d.dig()
    // }
    if (death) {
      return 0
    }
    death = true
    let pal = [DARK, DARK_BLUE, OBSIDIAN, DARK_GREY, GREY]
    let rcols = [DARK, OBSIDIAN, DARK_GREY, RED, MRED, DRED]
    let dt = deathRestartT
    for (let i = 0; i < dt / 4 * .9; i++) {
      pal.push(GREY)
      if (random() > .8) {
        let c = ~~map(random(), 0, 1, 0, rcols.length - 1)
        pal.push(rcols[c])
      }
    }
    pal.push(DARK_GREY)
    let cx = this.cx
    let cy = this.cy
    new Notification(
      () => {
        let s = ' opens a gateway to hell.'
        let glitches = '*-_#$1{}%▉'
        deathT += 1
        let ng = ~~max(map(deathT / deathRestartT, 0, 1, -3, s.length * .6), 0)
        for (let i = 0; i < ng; i++) {
          let ci = ~~random(s.length - 1)
          s = s.slice(0, ci - 1) + glitches[~~random(glitches.length - 1)] + s.slice(ci)
        }
        text(s, board.hpad + (~~(board.cols / 2 - (s.length - 1) / 2)) * (board.lw + board.lwp), titleY + board.lh + board.lhp * 7)
        fill(BACKGROUND)
        noStroke()
        if (title[title.length - 1] == '.') {
          rect(titleX + textWidth(title) - textWidth('.'), titleY + board.lhp, textWidth('.'), -(board.lh + board.lhp))
        }
        // spawn flames
        if (random() < map(deathT / deathRestartT, 0, 1, .25, 1.1)) {
          let x = ~~(cx + map(random(), 0, 1, -12.5, 12.5) + random() * deathT / deathRestartT * 15)
          let y = ~~(cy + map(random(), 0, 1, -7.5, 8.5) + random() * deathT / deathRestartT * 15)
          try {
            let d = world.get(x, y)
            d.bury(0, new Gateway(~~random(this.symbolsList.length / 3), 1, 0, 0), 0, true, true)
          } catch (error) {

          }
          x = map(random() * deathT / deathRestartT, 0, 1, -1.5, 1.5)
          shake.shake(map(random() * deathT / deathRestartT, 0, 1, 2, 5))
          muns = muns + map(random(), 0, 1, -5000000000000000000000, 5000000000000000000000)
          prevMs = muns
        }
      }, dt,
      pal
    )

    for (let i = 0; i < 35; i++) {
      let x = ~~(this.cx + map(random(), 0, 1, -12.5, 12.5))
      let y = ~~(this.cy + map(random(), 0, 1, -7.5, 8.5))
      let d = world.get(x, y)
      d.bury(0, new Gateway(~~random(this.symbolsList.length / 3), 1, 0, 0), 0, true, true)
    }
    prevMs += this.value
    return this.value
  }
}

class Palette {
  constructor(colorList, colors, colorMin, colorMax) {
    colorList = colorList || null
    colors = colors || 16
    colorMin = colorMin || 0
    colorMax = colorMax || 255
    this.colorList = []
    if (colorList) {
      this.colorList = colorList
    } else {
      for (let i = 0; i < colors; i++) {
        this.colorList.push(color(colorMin + ~~(i / (colors - 1) * (colorMax - colorMin))))
      }
    }
    this.nColors = this.colorList.length
  }
  getf(f) {
    // returns palette color given float 0,1 inclusive
    return this.get(~~(f * (this.nColors - 1)))
  }
  get(i) {
    return this.colorList[i]
  }
  set(i, newColor) {
    return this.colorList[i] = newColor
  }
}

class Dirt {
  constructor(depth, palette) {
    this._contents = {}
    this.palette = palette
    this.depth = depth
    this.color = null
    let topSoil = this.topSoilShade()
    this._resetColor(topSoil)
    this.symbol = GRADIENT[depth]
    this.revealed = null
    this.topSoil = topSoil < STONE_AT
    this.updateMem = null
    this.stuckCount = 0
  }
  _setContents(item, depth, position) {
    this._contents[depth] = {
      item: item,
      position: position
    }
  }
  link(memCard, x, y) {
    this.updateMem = memCard.linkUpdate(this, x, y)
  }
  topSoilShade() {
    return max(this.depth * 2 / 3 - 2, 0)
  }
  growTopSoil() {
    this._resetColor(this.topSoilShade())
  }
  _resetColor(depth) {
    this.color = this.palette.getf(1 - depth / GRADIENT.length)
  }
  rprobe(relativeDepth) {
    let depth = ~~((GRADIENT.length - this.depth) * (relativeDepth) + this.depth)
    depth = max(this.depth + 1, depth)
    if (this._contents[depth]) {
      return false
    }
    return depth
  }
  probe(depth) {
    // depth = max(this.depth+1,~~depth)
    if (depth <= this.depth || this._contents[depth]) {
      return false
    }
    return depth
  }
  exactBury(depth, item, itemPosition) {
    // console.log(`attempt at ${depth} | dirt at ${this.depth}`)
    itemPosition = itemPosition || 0
    if (!this.probe(depth)) {
      return false
    }
    this._setContents(item, depth, itemPosition)
    return true
  }
  bury(relativeDepth, item, itemPosition, surface, newItem) {
    surface = surface || false
    itemPosition = itemPosition || 0
    let depth;
    if (surface) {
      if (this._contents[this.depth]) {
        // console.log('taken')
        return false
      }
      depth = this.depth
    } else {
      depth = this.rprobe(relativeDepth)
      if (!depth) {
        return false
      }
    }
    this._setContents(item, depth, itemPosition)
    if (newItem) {
      this.updateMem(true, depth)
    }
    if (surface) {
      this.revealed = this._contents[depth]
      item.uncover()
    }
    return true
  }
  dig() {
    // console.log(Object.keys(this._contents))
    let nearestDepth = Math.min.apply(Math, Object.keys(this._contents))
    // fix broken valuables
    // console.log(nearestDepth, this.depth)
    let prevDepth = this.depth
    if (this.depth > nearestDepth) {
      this.depth = nearestDepth - 1
      this.stuckCount = 0 // <- here?
      return
    }
    if (!this.revealed) {
      this.depth = min(GRADIENT.length - 1, this.depth + 1)
      this.stuckCount = 0
      this.topSoil = false
      this._resetColor(this.depth)
      this.symbol = GRADIENT[this.depth]
      if (this._contents[this.depth]) {
        this.revealed = this._contents[this.depth]
        this.revealed.item.uncover()
      }
    } else {
      this.stuckCount += 1
      // check for bugged stuck gems
      if (this.stuckCount >= 3) {
        if (!this._contents[this.depth] || this.revealed.item != this._contents[this.depth].item) {
          this.revealed = null
          console.log('stuck happened')
          return this.dig()
        }
        let gd = this.revealed.item.gid
        if (gd) {
          let dp = treasuresSave[gd][3]
          let dirts = treasures[gd]
          let allUncovered = true
          for (let i = 0; i < dirts.length; i++) {
            let it = dirts[i]._contents[dp]
            if (it && !it.item.uncovered) {
              allUncovered = false
            }
          }
          if (allUncovered) {
            let maybe = false
            for (let i = 0; i < dirts.length; i++) {
              let it = dirts[i]._contents[dp]
              if (it && it.item.gid == gd) {
                it.item.allUncovered = true
              } else {
                // console.log(dirts)
                maybe = true
              }
            }
            // return this._contents[this.depth]
          }
        }
        // check for broken gems here if needed
      }
      // console.log(this.revealed.item.allUncovered)
      if (this.revealed.item.allUncovered && this.revealed.item.gid != 1) {
        if (!this._contents[this.depth] || this.revealed.item != this._contents[this.depth].item) {
          console.log('could have been stuck')
          this.revealed = this._contents[nearestDepth]
          return
        }
        delete this._contents[this.depth]
        let item = this.revealed
        this.revealed = null

        this.depth = min(GRADIENT.length - 1, this.depth + 1)
        this.topSoil = false
        this._resetColor(this.depth)
        this.symbol = GRADIENT[this.depth]
      }
    }
    if (this.depth != prevDepth) {
      this.updateMem()
    }
    if (prevDepth == GRADIENT.length - 2 && this.depth == GRADIENT.length - 1) {
      dugAll += 1
      if (!dugAllReached) {
        if (dugAll >= dugAllNeeded && notifications.length == 0) {
          dugAllReached = true
          new Notification(
            () => {
              let s = 'shakes the foundation.'
              text(s, board.hpad + (~~(board.cols / 2 - (s.length - 1) / 2)) * (board.lw + board.lwp), titleY + board.lh + board.lhp * 7)
              fill(BACKGROUND)
              noStroke()
              if (title[title.length - 1] == '.') {
                rect(titleX + textWidth(title) - textWidth('.'), titleY + board.lhp, textWidth('.'), -(board.lh + board.lhp))
              }
            }, 80
          )
        }
      }
    }
    return this._contents[this.depth]
  }
}

class Upgrade {
  constructor(cost, costMult, maxLvl, initialLvl) {
    this.cost = cost
    this.lvl = initialLvl || 0
    this.defaultColor = DARK_GREY
    this.costMult = costMult
    this.maxLvl = maxLvl
  }
  draw(x, y) { }
  buy(skip) {
    this.cost = ~~(this.cost * this.costMult)
    this.lvl += 1
    if (this.lvl >= this.maxLvl) {
      this.cost = -1
      this.lvl = this.maxLvl
    }
    if (!skip) {
      this.afterBuy()
    }
  }
  afterBuy() { }
}

class Wagon extends Upgrade {
  constructor(cost) {
    super(cost, 1, 1)
    this.onColor = WHITE
    this.dirs = { 'u': 0, 'r': 1, 'd': 2, 'l': 3 }
    this.bodies = 'OCOD'
    this.mouths = [
      'vV:', '<=-', '^:\'', '>=-'
    ]
    this.possibleDirs = [
      [0, 1, 3], [1, 2, 0], [2, 3, 1], [3, 0, 2]
    ]
    this.dDeltas = [
      [0, -1], [1, 0], [0, 1], [-1, 0]
    ]
    this.bodyColors = [
      WHITE, WHITE, WHITE, WHITE, WHITE
    ]
    this.mouthLvlColors = [
      WHITE, WHITE, WHITE, SSKYBLUE, color(120, 60, 108)
    ]
    this.moveEvery = [
      0, 0, 9, 11, 11
    ]
    this.dir = 1
    this.x = 0
    this.y = 0
    this.t = 0
    this.tTill = 0
    this.tools = [
      null,
      null,
      new Tool(1, 1, 2, '.', 0, STONE_AT, 2),
      new Tool(1, 1, 3, '.', 0, DEEP_AT, 2),
      new Tool(1, 1, 4, '.', 0, GRADIENT.length + 1, 2),
    ]
  }
  draw(x, y) {
    // console.log(this.defaultColor, this.onColor)
    if (this.lvl == 0) {
      fill(this.defaultColor)
    } else {
      fill(this.onColor)
    }
    if (this.lvl <= 1) {
      text('c.', x, y)
    } else {
      text('C', x, y)
      fill(this.mouthLvlColors[this.lvl])
      text(' <', x, y)
    }
  }
  updatec() {
    this.t += 1
    if (this.t >= this.tTill) {
      // decide to/move
      this.t = 0
      this.tTill = this.moveEvery[this.lvl]
      this.tTill += ~~random(-this.moveEvery[this.lvl] * .3, this.moveEvery[this.lvl] * .3)
      if (random(this.maxLvl + 1.5) < this.lvl) {
        // move
        let deltas = this.dDeltas
        let [dx, dy] = deltas[this.dir]
        this.x = ~~(this.x + dx)
        this.y = ~~(this.y + dy)
        let xx = this.x
        let yy = this.y
        let posD = this.possibleDirs[this.dir]
        let player = [~~(cam.x + board.cols / 2), ~~(cam.y + board.rows / 2)]
        let dst = dist(this.x, this.y, player[0], player[1])
        let probs = [1, 1, 1]
        if (dst > (board.cols + board.rows) / 4 * .65) {
          let md = dst * 2
          let mn = 0
          posD.forEach((d, i) => {
            let [dx, dy] = deltas[d]
            let dt = dist(xx + dx, yy + dy, player[0], player[1])
            if (dt < md) { mn = i; md = dt }
          })
          probs[mn] *= 3
        }
        posD.forEach((d, i) => {
          let [dx, dy] = deltas[d]
          try {
            let dirt = world.get(xx + dx, yy + dy)
            if (dirt.revealed) {
              probs[i] -= .5
              probs[i] *= .3
            } else {
              probs[i] = probs[i] * .7 * max(1 - dirt.depth / (GRADIENT.length - 1), 0) + probs[i] * .3
              if (dirt.topSoil) { probs[i] *= 1.5 }
            }
          } catch {
            probs[i] = 0
          }
        })

        let mxProb = probs.reduce((a, b) => a + b, 0)
        let prob = random(mxProb)
        let m = 0
        let di = 0
        for (let i = 0; i < probs.length; i++) {
          m += probs[i]
          if (prob <= m) {
            di = i
            break
          }
        }
        this.dir = posD[di]
      }
    } else if (this.t == ~~(this.tTill * 2 / 3)) {
      let [dx, dy] = this.dDeltas[this.dir]
      let dirt
      try {
        dirt = world.get(this.x + dx, this.y + dy)
        if (dirt.revealed) { return }
      } catch {
        return
      }
      let prevLvl = dirt.depth
      let wasTopSoil = dirt.topSoil
      this.tools[this.lvl].dig(this.x + dx, this.y + dy)
      if (prevLvl != dirt.depth) {
        let val = 1
        if (prevLvl >= STONE_AT && !wasTopSoil) { val = 2 }
        if (prevLvl >= DEEP_AT) { val = 5 }
        prevMs += val
        muns += val
        munsUp += val
        munAddPopup.popup(val, ORANGE)
      }
      saveCounter += 1
      return true
    }
  }
  drawc() {
    let [wcx, wcy] = wagon.boardCoords()
    if (wcx >= 1 && wcx < board.cols - 1 &&
      wcy >= 1 && wcy < board.rows - 1) {
      board.write(this.bodies[this.dir],
        wcx, wcy,
        this.bodyColors[this.lvl]
      )
    }
    let [dx, dy] = this.dDeltas[this.dir]
    let fx = dx + wcx
    let fy = dy + wcy
    if (fx >= 1 && fx < board.cols - 1 &&
      fy >= 1 && fy < board.rows - 1) {
      let dms = this.mouths[this.dir]
      let until = this.moveEvery[this.lvl]
      let untilStill = until * .2
      let untilClamp = ~~(until * .8)
      let t = ~~(max(this.t, untilStill) - untilStill)
      t = t % untilClamp
      let fr = dms[~~map(t, 0, untilClamp, 0, dms.length, true)]
      board.write(fr,
        fx, fy,
        this.mouthLvlColors[this.lvl]
      )
    }
  }
  boardCoords() {
    return [~~(this.x - ~~cam.x), ~~(this.y - ~~cam.y)]
  }
  dontDraw() {
    return this.boardCoords()
  }
  convertUpgrade() {
    this.cost = 45000
    this.costMult = 3
    this.maxLvl = 4
    let xy = random() > .5
    let neg = random() > .5 ? 1 : -1
    this.x = ~~(cam.x + board.cols / 2 + random(-board.cols / 3, board.cols / 3))
    this.y = ~~(cam.y + board.rows / 2 + random(-board.rows / 3, board.rows / 3))
    if (xy) {
      this.x = ~~(cam.x + 1 + (board.cols - 3) / 2 + (board.cols - 3) / 2 * neg)
      this.dir = 2 + neg
    } else {
      this.y = ~~(cam.y + 1 + (board.rows - 3) / 2 + (board.rows - 3) / 2 * neg)
      this.dir = 1 + -neg
    }
    this.x = constrain(this.x, 0, world.cols - 1)
    this.y = constrain(this.y, 0, world.rows - 1)
  }
  afterBuy() {
    let notifs = {
      1: [60, 'on a wagon.'],
      2: [80, 'finds a friend.'],
      4: [80, 'lets loose a beast.']
    }
    let notif = notifs[this.lvl]
    if (notif) {
      new Notification(
        () => {
          let s = notif[1]
          text(s, board.hpad + (~~(board.cols / 2 - (s.length - 1) / 2)) * (board.lw + board.lwp), titleY + board.lh + board.lhp * 7)
          fill(BACKGROUND)
          noStroke()
          if (title[title.length - 1] == '.') {
            rect(titleX + textWidth(title) - textWidth('.'), titleY + board.lhp, textWidth('.'), -(board.lh + board.lhp))
          }
        }, notif[0]
      )
    }
    if (pickaxe.lvl == pickaxe.maxLvl && this.maxLvl == 1) {
      this.convertUpgrade()
    }
  }
}

class Tool extends Upgrade {
  constructor(cost, costMult, initialLvl, symbol, lvlMinDig, lvlMaxDig, toolLvl, maxPhrase, titleReplace, lvlColors, maxLvl) {
    maxLvl = maxLvl || 5
    super(cost, costMult, maxLvl, initialLvl)
    this.maxPhrase = maxPhrase
    this.titleReplace = titleReplace || false
    this.toolLvl = toolLvl
    this.handleColor = BROWN
    this.symbol = symbol || '-'
    this.lvlColors = lvlColors || [
      this.defaultColor,
      BROWN,
      MID_GREY,
      WHITE,
      SSKYBLUE,
      OBSIDIAN
    ]
    this.lvlMinDig = lvlMinDig || 0
    this.lvlMaxDig = lvlMaxDig || GRADIENT.length + 1
    this.range = [
      [],
      [[0, 0, .6]],
      [[0, 0, 1]],
      [[0, 0, 1],
      [-1, -1, .1], [0, -1, .7], [1, -1, .1],
      [-1, 0, .7], [1, 0, .7],
      [-1, 1, .1], [0, 1, .7], [1, 1, .1]],

      [[0, 0, 1], [0, -2, .4],
      [-1, -1, .7], [0, -1, 1], [1, -1, .7],
      [-2, 0, .4], [-1, 0, 1], [1, 0, 1], [2, 0, .4],
      [-1, 1, .7], [0, 1, 1], [1, 1, .7],
      [0, 2, .4]],

      [[0, 0, 1], [0, -3, .1],
      [-1, -2, .9], [0, -2, 1], [1, -2, .9],
      [-2, -1, .9], [-1, -1, 1], [0, -1, 1], [1, -1, 1], [2, -1, .9],
      [-3, 0, .1], [-2, 0, 1], [-1, 0, 1], [1, 0, 1], [2, 0, 1], [3, 0, .1],
      [-2, 1, .9], [-1, 1, 1], [0, 1, 1], [1, 1, 1], [2, 1, .9],
      [-1, 2, .9], [0, 2, 1], [1, 2, .9],
      [0, 3, .1]],
    ]
  }
  draw(x, y) {
    // console.log(this.lvlColors)
    if (this.lvl == 0) {
      fill(this.defaultColor)
      text('-' + this.symbol, x, y)
    } else {
      fill(this.handleColor)
      text('-', x, y)
      // console.log(this.lvl, this.lvlColors)
      fill(this.lvlColors[this.lvl])
      text(' ' + this.symbol, x, y)
    }
  }
  dig(x, y) {
    // console.log(this.symbol, 'dig', this.lvl)
    let canDig;
    try {
      canDig = this.canDig(world.get(x, y))
    } catch (error) {
      canDig = false
    }
    // console.log('candig',x,y,canDig)
    if (!canDig) {
      return false
    }
    let spots = this.range[this.lvl]
    let item = null;
    for (let i = 0; i < spots.length; i++) {
      let s = spots[i]
      // console.log(i,s, spots)
      let dx = s[0] + x
      let dy = s[1] + y
      // console.log(dx,dy)
      let prob = s[2]
      let fail = false
      let dirt;
      try {
        dirt = world.get(dx, dy)
      } catch (error) {
        fail = true
      }
      // console.log('fail', fail)
      if (fail) { continue }
      // console.log('can', this.canDig(dirt))
      if (!this.canDig(dirt)) { continue }
      let r = random()
      let proba = r > prob
      // console.log('prob', r, prob, proba)
      if (proba) { continue }
      if (i == 0) {
        item == dirt.dig()
      } else if (!dirt.revealed) {
        dirt.dig()
      }
    }
    return item
  }
  canDig(dirt) {
    if (!dirt) { return false }
    return (dirt.depth < this.lvlMaxDig && dirt.depth >= this.lvlMinDig) || dirt.topSoil || dirt.revealed
  }
  afterBuy() {
    if (this.lvl == 1 && this.toolLvl > 0) {
      let lvl = this.toolLvl
      new Notification(
        () => {
          let name = pickNames[lvl]
          let s = `with ${name}.`
          text(s, board.hpad + (~~(board.cols / 2 - (s.length - 1) / 2)) * (board.lw + board.lwp), titleY + board.lh + board.lhp * 7)
          fill(BACKGROUND)
          noStroke()
          if (title[title.length - 1] == '.') {
            rect(titleX + textWidth(title) - textWidth('.'), titleY + board.lhp, textWidth('.'), -(board.lh + board.lhp))
          }
        }
      )
    } else if (this.lvl == this.maxLvl) {
      if (this.symbol == ')') {
        if (wagon.lvl == 1) {
          wagon.convertUpgrade()
        }
      }
      if (this.titleReplace) {
        let notif
        notif = new Notification(
          () => {
            noStroke()
            if (title[title.length - 1] == '.') {
              rect(titleX + (board.lw + board.lwp) * (title.indexOf(',')), titleY + board.lhp * 2, (board.lw + board.lwp) * (title.length - title.indexOf(',')), -(board.lh + board.lhp * 2))
            }
            if (notif.life == 1) {
              let nnotif = new Notification(
                () => {
                  let s = 'hears an ominous noise.'
                  text(s, board.hpad + (~~(board.cols / 2 - (s.length - 1) / 2)) * (board.lw + board.lwp), titleY + board.lh + board.lhp * 7)
                  fill(BACKGROUND)
                  noStroke()
                  if (title[title.length - 1] == '.') {
                    rect(titleX + textWidth(title) - textWidth('.'), titleY + board.lhp, textWidth('.'), -(board.lh + board.lhp))
                  }
                  if (nnotif.life == 1) {
                    noiseStart = true
                  }
                }
              )
            }
          }, 60,
          [
            color(37, 40, 50, 1 * 255),
            color(37, 40, 50, .9 * 255),
            color(37, 40, 50, .75 * 255),
            color(37, 40, 50, .45 * 255),
            color(37, 40, 50, .2 * 255),
            color(37, 40, 50, 0 * 255),
            color(37, 40, 50, 0 * 255),
            color(37, 40, 50, 0 * 255),
            color(37, 40, 50, 0 * 255),
            color(37, 40, 50, 0 * 255),
            color(37, 40, 50, 0 * 255),
            color(37, 40, 50, 0 * 255),
            color(37, 40, 50, 0 * 255),
            color(37, 40, 50, 0 * 255),
            color(37, 40, 50, 0 * 255),
            color(37, 40, 50, 0 * 255),
            color(37, 40, 50, 0 * 255),
            color(37, 40, 50, 0 * 255),
            color(37, 40, 50, 0 * 255),
            color(37, 40, 50, 0 * 255),
            color(37, 40, 50, 0 * 255),
            color(37, 40, 50, 0 * 255),
            color(37, 40, 50, 0 * 255),
            color(37, 40, 50, 0 * 255),
          ]
        )
      } else {
        let phrase = this.maxPhrase
        new Notification(
          () => {
            let s = phrase
            text(s, board.hpad + (~~(board.cols / 2 - (s.length - 1) / 2)) * (board.lw + board.lwp), titleY + board.lh + board.lhp * 7)
            fill(BACKGROUND)
            noStroke()
            if (title[title.length - 1] == '.') {
              rect(titleX + textWidth(title) - textWidth('.'), titleY + board.lhp, textWidth('.'), -(board.lh + board.lhp))
            }
          },
        )
      }
    }
  }
}

class World {
  constructor(cols, rows, xscale, yscale, seed, palette, memCard) {
    palette = palette || null
    this.memoryCard = memCard
    this.grid = []
    this.rows = rows
    this.cols = cols
    this.seed = seed
    this.xscale = xscale
    this.yscale = yscale
    this.palette = new Palette(palette)
  }
  save() {
    this.memoryCard.save()
  }
  load() {
    this.memoryCard.load()
  }
  new() {
    this.grid = []
    for (let y = 0; y < this.rows; y++) {
      this.grid.push([])
      for (let x = 0; x < this.cols; x++) {
        let pn = noise(x * this.xscale, y * this.yscale, this.seed)
        let depth = ~~(pn * GRADIENT.length)
        let dirt = new Dirt(depth, this.palette)
        dirt.link(this.memoryCard, x, y)
        this.grid[y].push(dirt)
      }
    }
  }
  get(x, y) {
    return this.grid[y][x]
  }
}

class BoardDraw {
  constructor(fontSize, font, color, rows, cols, topPadding, bottomPadding) {
    rows = rows || -1
    cols = cols || -1
    topPadding = topPadding || 0
    bottomPadding = bottomPadding || 0
    this.font = font
    this.fontSize = fontSize
    this.stretch = rows <= 0 && cols <= 0
    this.rows = rows
    this.cols = cols
    this.color = color

    // avoid changing fontSize too much..
    textSize(this.fontSize)
    textFont(this.font)

    this.lw = font.textBounds('Z').w
    this.lwp = font.textBounds('ZZ').w - this.lw * 2 + 1
    this.lh = font.textBounds('Z').h
    this.lhp = this.lwp
    this.tpad = topPadding
    this.bpad = bottomPadding

    this.windowResize()
    this.prevColor = true
    
  }
  restretch() {
    this.cols = ~~(windowWidth / (this.lw + this.lwp))
    this.rows = ~~((windowHeight - (this.tpad + this.bpad)) / (this.lh + this.lhp))
  }
  windowResize() {
    if (this.stretch) {
      this.restretch()
    }
    this.w = this.cols * (this.lw + this.lwp) + this.lwp / 2
    this.hpad = (windowWidth - this.w) / 2
    this.h = this.rows * (this.lh + this.lhp) + this.lhp / 2
    this.vpad = ((windowHeight) - (this.h - this.tpad + this.bpad)) / 2
  }
  write(str, xi, yi, color, resetFont, resetFontSize) {
    color = color || null
    resetFont = resetFont || false
    resetFontSize = resetFontSize || false
    // avoid using fill too much
    if (this.prevColor != color) {
      this.prevColor = color
      fill(color)
    }
    // or textSize
    if (resetFontSize) {
      textSize(this.fontSize)
    }
    // or font
    if (resetFont) {
      textFont(this.font)
    }

    let y = (this.lh + this.lhp) * (yi + 1)
    let x = (this.lw + this.lwp) * xi
    text(str, x + this.hpad, y + this.vpad);
  }
}

class Camera {
  constructor(x, y, minX, minY, maxX, maxY, power, friction) {
    this.x = x
    this.y = y
    this.minX = minX
    this.maxX = maxX
    this.minY = minY
    this.maxY = maxY
    this.power = power
    this.friction = friction
    this.dx = 0
    this.dy = 0
  }
  nudge(x, y) {
    this.dx += x * this.power
    this.dy += y * this.power
  }
  update() {
    this.x += this.dx
    this.y += this.dy
    this.dx *= this.friction
    this.dy *= this.friction
    this.x = constrain(this.x, this.minX, this.maxX)
    if (this.x == this.minX || this.x == this.maxX) {
      this.dx = 0
    }
    this.y = constrain(this.y, this.minY, this.maxY)
    if (this.y == this.minY || this.y == this.maxY) {
      this.dy = 0
    }
  }
}

class ScreenShake {
  constructor() {
    this.t = 0
    this.x = 0
    this.y = 0
    this.dx = 0
    this.dy = 0
    this.maxPower = 20
  }
  shake(power) {
    power = power || 6
    this.t = min(this.maxPower, this.t + power)
    this.x += random(-this.t / this.maxPower, this.t / this.maxPower) * 14
    this.y += random(-this.t / this.maxPower, this.t / this.maxPower) * 14
  }
  update() {
    this.t = max(this.t * .84, 0)
    this.x += this.dx
    this.y += this.dy
    translate(this.x, this.y)
    this.x *= .5
    this.y *= .5
    if (this.t > 0) {
      // this.dx += random(-this.t/this.maxPower,this.t/this.maxPower)*20
      // this.dy += random(-this.t/this.maxPower,this.t/this.maxPower)*20
      this.x += random(-this.t / this.maxPower, this.t / this.maxPower) * 10
      this.y += random(-this.t / this.maxPower, this.t / this.maxPower) * 10
    }
    this.dx *= .8
    this.dy *= .8
  }
}

function preload() {
  monoFont = loadFont('assets/ProggySquare.ttf');
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  board.windowResize()
  setTitleDims(title)
  munAddPopup.x = board.hpad + (board.lw + board.lwp) * 6
  munAddPopup.y = board.vpad
}

function setup(newWorld) {
  if (mainTheme) {
    mainTheme.stop()
  }
  mainTheme = new BGM('assets/house_by_the_mine.mp3', true)
  firstMuns = true
  pants = 0
  fetchp = 0
  chestFound = 0
  dugAll = 0
  chestFoundReached = false
  dugAllReached = false
  muns = 0
  deathT = 0
  death = false
  dmungeT = 0
  noiseStart = false
  // newWorld = true
  let debug = false
  createCanvas(windowWidth, windowHeight);
  STONE = color('#848a8c')
  OBSIDIAN = color('#604559')
  DARK = color('#231726')
  palette = [
    color('#4e7b6e'),
    color('#4e7b6e'),
    color('#427b73'),
    color('#4e7b6e'),
    color('#427b73'),
    color('#427b73'),
    color('#4e7b6e'),
    color('#427b73'),
    color('#4e7b6e'),
    color('#4e7b6e'), //dark green
    color('#8ea590'), // light green
    color('#b3b097'), // sand
    color('#987344'), // light dirt
    color('#4f453b'), // dark dirt
    color('#4f453b'), // dark dirt
    STONE, // stone
    STONE, // stone
    STONE, // stone
    color('#74767a'),
    color('#74767a'),
    color('#68696f'),
    color('#606266'),
    color('#525256'),
    color('#525256'),
    color('#4a4f50'),
    color('#37496e'),
    OBSIDIAN, // obsidian
    color('#4e353b'),
    color('#4e353b'),
    color('#4e353b'),
    color('#4e353b'),
    color('#4e353b'),
  ]
  palette.reverse()
  BACKGROUND = color(37, 40, 50)
  background(BACKGROUND)
  WWHITE = color(250)
  WHITE = color(240)
  LIGHT_GREY = color(220)
  GREY = color(200)
  MID_GREY = color(120, 120, 123)
  DARK_GREY = color(80, 80, 90)
  YELLOW = color(250, 250, 100)
  ORANGE = color(250, 200, 130)
  BROWN = color(199, 134, 91)
  SKYBLUE = color(210, 210, 240)
  SSKYBLUE = color(161, 235, 240)
  TEAL = color(160, 240, 210)
  RED = color(207, 40, 49)
  MRED = color(184, 50, 67)
  DRED = color(105, 30, 34)
  PINK = color(240, 147, 147)
  PURPLE = color(184, 69, 101)
  BLUE = color(50, 120, 220)
  DARK_BLUE = color(40, 50, 90)
  munFlashPal = [
    ORANGE,
    WWHITE,
    color(250, 240, 130),
    GREY,
    YELLOW,
    GREY,
    YELLOW,
    GREY,
    TEAL,
    GREY,
    TEAL,
    WHITE,
    RED,
    WHITE,
    PINK,
    WHITE,
    BLUE,
    WHITE,
    SKYBLUE,
    WHITE,
    WWHITE,
    WHITE,
    WWHITE
  ]
  OpalPal = [
    WHITE,
    TEAL,
    SKYBLUE,
    ORANGE,
    TEAL,
    TEAL,
    WHITE,
    TEAL,
    SKYBLUE,
    TEAL,
    TEAL,
    SKYBLUE,
    SKYBLUE,
    TEAL,
    TEAL,
  ]
  RubyPal = [
    RED,
    MRED,
    MRED,
    RED,
    PINK,
    PURPLE,
    RED,
    RED,
    WHITE,
    PINK,
    PURPLE
  ]
  DiamondPal = [
    BLUE,
    SSKYBLUE,
    SSKYBLUE,
    SSKYBLUE,
    WWHITE,
    SSKYBLUE,
    SSKYBLUE,
    BLUE,
    SSKYBLUE,
    SSKYBLUE,
    SSKYBLUE,
    WWHITE,
    SSKYBLUE,
    WWHITE,
    SSKYBLUE,
    SSKYBLUE,
  ]
  endPal = [
    WHITE, LIGHT_GREY, GREY, MID_GREY, DARK_GREY, BACKGROUND
  ]

  board = new BoardDraw(
    gridFontSize, monoFont, GREY,
    26,
    32,
    titleHeight,
    upgradeHeight
  )
  yratio = (board.lh + board.lhp) / (board.lw + board.lwp)
  seed = random(10000)

  memoryCard = new Serialize()

  munAddPopup = new MunAddPopup(board.hpad + (board.lw + board.lwp) * 6, board.vpad)
  shake = new ScreenShake()


  title = 'a tiny prospector.'

  notifications = []
  if (!titleNotify) {
    titleNotify = function() {
      if (titleNotify.running) {
        titleNotify.running.life = 0
      }
      titleNotify.running = new Notification(
        () => { text(titleNotify.title, titleNotify.titleX, titleNotify.titleY) },
        20,
        [
          OBSIDIAN,
          SSKYBLUE,
          DARK_GREY,
          GREY,
          GREY,
          GREY,
          LIGHT_GREY,
          WHITE,
          WHITE,
          WWHITE,
          WWHITE,
          color(255),
          color(255),
          color(255),
          color(255),
          color(255),
          color(255),
          color(255),
          WWHITE,
          WWHITE,
          WHITE,
          WHITE,
          LIGHT_GREY,
        ]
      )
    }
  }
  restartTimer = 0;
  restartPressedTimes = 0;
  saveCounter = 0


  let wcs = board.cols * 4
  let wrs = board.rows * 4 * yratio
  world = new World(
    wcs, wrs,
    1 / 25, (1 / 25) * yratio,
    seed,
    palette,
    memoryCard
  )

  cam = new Camera(
    (wcs - board.cols + 2.5) / 2,
    (wrs - board.rows + 2.5) / 2,
    0, 0,
    wcs - board.cols + 2.5, wrs - board.rows + 2.5,
    .2, .8
  )
  cht = false

  if (newWorld || !getItem('pkg')) {
    world.new()

    let shovel = new Tool(debug ? 1 : 30, upgradeCostMults[1], 1, '>', 0, STONE_AT, 0, toolPhrases[0])
    pickaxe = new Tool(debug ? 1 : 200, upgradeCostMults[2], 0, ')', STONE_AT, DEEP_AT, 1, toolPhrases[1])
    let epicaxe = new Tool(debug ? 1 : 1337, upgradeCostMults[3], 0, '}', STONE_AT + (DEEP_AT - STONE_AT) / 2, GRADIENT.length + 1, 2, toolPhrases[2], true)
    // epicaxe.lvlColors = [
    //     DARK_GREY,
    //     GREY,
    //     WHITE,
    //     SSKYBLUE,
    //     OBSIDIAN
    // ]
    tools = [
      shovel,
      pickaxe,
      epicaxe
    ]

    wagon = new Wagon(debug ? 1 : 300)
    upgrades = [
      wagon,
      shovel,
      pickaxe,
      epicaxe
    ]

    // populate valuables
    treasures = {}
    treasuresSave = {}

    // gateway
    let gid = 1
    let x = ~~random(world.cols - 9) + 1
    let y = ~~random(world.rows - 6) + 1
    let group = []
    let gi = 0
    let pi = 0
    for (let yo = 0; yo < 5; yo++) {
      for (let xo = 0; xo < 8; xo++) {
        if (gatewayShape[gi] == 1) {
          let dirt = world.get(x + xo, y + yo)
          let depth = GRADIENT.length - 1
          let gate = new Gateway(pi, gid, x + 3.5, y + 2)
          if (pi == 0) {
            treasuresSave[gid] = [gate, x, y, depth]
          }
          group.push(dirt)
          dirt.exactBury(depth, gate, pi)
          pi += 1
        }
        gi += 1
      }
    }
    treasures[gid] = group
    gid += 1


    let buried = 0
    let tried = 0
    let initialFail = 0
    let pairFail = 0
    let propo = proportions['chest']
    while (buried < (world.cols * world.rows) * propo && tried < (world.cols * world.rows) * 2.8) {
      group = []
      tried += 1
      let x = ~~random(world.cols - 4) + 1
      let y = ~~random(world.rows - 3) + 1
      let rdepth = random() * .2 + .8
      let dirt = world.get(x, y)
      let depth = dirt.rprobe(rdepth)
      if (!depth) {
        initialFail += 1
        continue
      }
      if (depth < DEEP_AT + 2) {
        initialFail += 1
        continue
      }
      let failed = false
      let dirts = [dirt]
      for (let xo = 0; xo < 3; xo++) {
        for (let yo = 0; yo < 2; yo++) {
          if (xo == 0 && yo == 0) {
            continue
          }
          let odirt = world.get(x + xo, y + yo)
          dirts.push(odirt)
          if (!odirt.probe(depth)) {
            failed = true
            yo = 2
            xo = 3
            break
          }
        }
      }
      if (failed) {
        continue
      }
      for (let xo = 0; xo < 3; xo++) {
        for (let yo = 0; yo < 2; yo++) {
          let dirt = world.get(x + xo, y + yo)
          group.push(dirt)
          let chest = new Chest(xo + 3 * yo, gid, x + 1, y + .5)
          if (xo == 0 && yo == 0) {
            treasuresSave[gid] = [chest, x, y, depth]
          }
          dirt.exactBury(depth, chest, xo + 3 * yo)
        }
      }
      treasures[gid] = group
      gid += 1
      buried += 1
    }
    console.log(`chest ${buried} < ${(world.cols * world.rows) * .1} | ${tried} < ${(world.cols * world.rows) * 1.8}`)
    console.log(`${initialFail} ${pairFail}`)

    for (let i = 0; i < (world.cols * world.rows) * .15; i++) {
      let x = ~~random(world.cols)
      let y = ~~random(world.rows)
      let dirt = world.get(x, y)
      dirt.bury(random() * .2, new Coin())
    }
    for (let i = 0; i < (world.cols * world.rows) * .2; i++) {
      let x = ~~random(world.cols)
      let y = ~~random(world.rows)
      let dirt = world.get(x, y)
      dirt.bury(random() * .9 + random() * .1, new Coin())
    }

    buried = 0
    tried = 0
    initialFail = 0
    pairFail = 0
    propo = proportions['opal']
    while (buried < (world.cols * world.rows) * propo && tried < (world.cols * world.rows) * 1.8) {
      group = []
      tried += 1
      let x = ~~random(world.cols - 3) + 1
      let y = ~~random(world.rows)
      let rdepth = random() * .3 + random() * .1 + .1
      let dirt = world.get(x, y)
      let depth = dirt.rprobe(rdepth)
      if (!depth) {
        initialFail += 1
        continue
      }
      let odirt = world.get(x + 1, y)
      if (!odirt.exactBury(depth, new Opal(1, gid), 1)) {
        pairFail += 1
        continue
      }
      let gem = new Opal(0, gid)
      dirt.bury(rdepth, gem, 0)
      treasures[gid] = [dirt, odirt]
      treasuresSave[gid] = [gem, x, y, depth]
      gid += 1
      buried += 1
    }
    console.log(`${buried} < ${(world.cols * world.rows) * .1} | ${tried} < ${(world.cols * world.rows) * 1.8}`)
    console.log(`${initialFail} ${pairFail}`)

    buried = 0
    tried = 0
    initialFail = 0
    pairFail = 0
    propo = proportions['ruby']
    while (buried < (world.cols * world.rows) * propo && tried < (world.cols * world.rows) * 1.8) {
      tried += 1
      let x = ~~random(world.cols - 3) + 1
      let y = ~~random(world.rows)
      let rdepth = random() * .5 + .3
      let dirt = world.get(x, y)
      let depth = dirt.rprobe(rdepth)
      if (!depth) {
        initialFail += 1
        continue
      }
      if (depth < STONE_AT + 1) {
        initialFail += 1
        continue
      }
      let odirt = world.get(x + 1, y)
      if (!odirt.exactBury(depth, new Ruby(1, gid), 1)) {
        pairFail += 1
        continue
      }
      let gem = new Ruby(0, gid)
      dirt.bury(rdepth, gem, 0)
      treasures[gid] = [dirt, odirt]
      treasuresSave[gid] = [gem, x, y, depth]
      gid += 1
      buried += 1
    }
    console.log(`${buried} < ${(world.cols * world.rows) * .1} | ${tried} < ${(world.cols * world.rows) * 1.8}`)
    console.log(`${initialFail} ${pairFail}`)

    buried = 0
    tried = 0
    initialFail = 0
    pairFail = 0
    propo = proportions['diamond']
    while (buried < (world.cols * world.rows) * propo && tried < (world.cols * world.rows) * 1.8) {
      tried += 1
      let x = ~~random(world.cols - 3) + 1
      let y = ~~random(world.rows)
      let rdepth = random() * .3 + .6
      let dirt = world.get(x, y)
      let depth = dirt.rprobe(rdepth)
      if (!depth) {
        initialFail += 1
        continue
      }
      if (depth < STONE_AT + (DEEP_AT - STONE_AT) / 2) {
        initialFail += 1
        continue
      }
      let odirt = world.get(x + 1, y)
      if (!odirt.exactBury(depth, new Diamond(1, gid), 1)) {
        pairFail += 1
        continue
      }
      let gem = new Diamond(0, gid)
      dirt.bury(rdepth, gem, 0)
      treasures[gid] = [dirt, odirt]
      treasuresSave[gid] = [gem, x, y, depth]
      gid += 1
      buried += 1
    }
    console.log(`${buried} < ${(world.cols * world.rows) * .1} | ${tried} < ${(world.cols * world.rows) * 1.8}`)
    console.log(`${initialFail} ${pairFail}`)


    memoryCard.setup()
    memoryCard.save()
  } else {
    // world.new()
    memoryCard.load()
    memoryCard.setup()
    firstMuns = false
  }
  setTitleDims(title)
  if (!startScreen) {
    titleNotify()
  }
  frameRate(30)
  prevMs = muns

  let buried = 0
  for (let x = 0; x < world.cols; x++) {
    for (let y = 0; y < world.rows; y++) {
      let d = world.get(x, y)
      buried += Object.values(d._contents).length
    }
  }
  console.log(buried)
}

function setTitleDims(title) {
  titleX = board.hpad + (~~(board.cols - title.length) / 2) * (board.lw + board.lwp) + board.lw + board.lwp
  titleY = board.vpad - titleHeight + (board.lh + board.lhp)
  titleNotify.title = title
  titleNotify.titleX = titleX
  titleNotify.titleY = titleY
}

function mousePressed() {
  if (!audio) {
    audio = new Sfx()
  }
}

function keyPressed() {
  if (!(death || startScreen)) {
    if (keyCode === ENTER || (keyCode === ESCAPE && restartPressedTimes == 0)) {
      restartTimer = restartWaitTime
      restartPressedTimes += 1
      memoryCard.save()
    }
    let k = key.toLowerCase()
    if (k != 'shift') {
      let s = 'kowlin'
      let ss = 'fetch'
      let trig = false
      if (k == s[pants]) {
        pants += 1
        if (pants >= s.length) {
          pants = 0
          trig = true
        }
      } else {
        pants = 0
      } if (k == ss[fetchp]) {
        fetchp += 1
        if (fetchp >= ss.length) {
          fetchp = 0
          trig = true
        }
      } else {
        fetchp = 0
      }
      if (trig) {
        let notif = new Notification(
          () => {
            let frames = [
              '|| ',
              '|| ',
              '|\\ ',
              ' /\\',
              ' /|',
              ' ||',
              ' ||',
              ' /|',
              '/\\ ',
              '|\\ ',
            ]
            let s = ' has your pants. ' + frames[~~(map(notif.life, 0, notif.maxLife - 1, frames.length * 4, 0)) % frames.length]
            text(s, board.hpad + (~~(board.cols / 2 - (s.length - 1) / 2)) * (board.lw + board.lwp), titleY + board.lh + board.lhp * 7)
            fill(BACKGROUND)
            noStroke()
            if (title[title.length - 1] == '.') {
              rect(titleX + textWidth(title) - textWidth('.'), titleY + board.lhp, textWidth('.'), -(board.lh + board.lhp))
            }
          }, 120
        )
      }
    }
  }
}

function draw() {

  if (mouseJustPressed) {
    mouseJustPressed = false
    mouseLetGo = false
  } else {
    if (mouseLetGo && mouseIsPressed) {
      mouseJustPressed = true
      mouseLetGo = false
    }
    if (!mouseIsPressed) {
      mouseLetGo = true
    }
  }

  // new planet
  if (death && deathT >= deathRestartT) {
    deathT += 1
    shake.update()
    let bg = WWHITE
    if (deathT - deathRestartT == 120) {
      title = 'a tiny prospector.'
      setTitleDims(title)
      new Notification(
        () => {
          noStroke()
          text(title, titleX, titleY)
        }, 400,
        [
          WHITE,
          WHITE,
          LIGHT_GREY,
          GREY,
          MID_GREY,
          DARK_GREY,
          DARK_GREY,
          DARK_GREY,
          DARK_GREY,
          DARK_GREY,
          DARK_GREY,
          DARK_GREY,
          DARK_GREY,
          DARK_GREY,
          DARK_GREY,
          DARK_GREY,
          DARK_GREY,
          DARK_GREY,
          DARK_GREY,
        ]
      )
    }
    if (deathT - deathRestartT == 340) {
      let s = ' tries another planet.'
      title = 'a tiny prospector'
      new Notification(
        () => {
          noStroke()
          text(s, titleX + textWidth(title) / 2 - textWidth(s) / 2 - textWidth('.') * .2, titleY + board.lh + board.lhp * 7)
        }, 250,
        [
          WHITE,
          WHITE,
          LIGHT_GREY,
          GREY,
          MID_GREY,
          DARK_GREY,
          DARK_GREY,
          DARK_GREY,
          DARK_GREY,
          DARK_GREY,
          DARK_GREY,
          DARK_GREY,
          DARK_GREY,
          DARK_GREY,
          DARK_GREY,
          DARK_GREY,
          DARK_GREY,
          DARK_GREY,
          DARK_GREY,
          DARK_GREY,
          DARK_GREY,
        ]
      )
    }
    background(bg)
    notifications.forEach(n => { n.draw() });
    if (deathT - deathRestartT >= 90 + 400) {
      // setup(true)
      let alpha = ~~((deathT - deathRestartT - (90 + 400)) * 10)
      BACKGROUND.setAlpha(alpha)
      if (alpha >= 255) {
        setup(true)
        return
      }
      background(BACKGROUND)
    }
    return
  }
  background(BACKGROUND)

  // start screen
  if (startScreen) {
    let s = '->'
    let twb = textWidth(s)
    let sx = titleX + textWidth(title) / 2 - twb / 2 - textWidth('.') * .2
    let sy = titleY + board.h / 2 + board.lh + board.lhp * 7
    let tty = titleY + board.h / 2 - board.lh
    // first frame, start animations
    if (sst == 0) {
      new Notification(
        () => {
          noStroke()
          text(s, sx, sy)
        }, 55,
        [
          DARK_GREY,
          DARK_GREY,
          DARK_GREY,
          DARK_GREY,
          DARK_GREY,
          DARK_GREY,
          DARK_GREY,
          DARK_GREY,
          MID_GREY,
          DARK_GREY,
          MID_GREY,
          GREY,
          MID_GREY,
          LIGHT_GREY,
          GREY,
          LIGHT_GREY,
          WHITE,
        ]
      )
      new Notification(
        () => {
          noStroke()
          text(title, titleX, tty)
        }, 30,
        [
          DARK_GREY,
          DARK_GREY,
          DARK_GREY,
          MID_GREY,
          MID_GREY,
          WHITE,
          WHITE,
        ]
      )
    }

    fill(WHITE)
    if (sst > 0) {
      text(title, titleX, tty)
    }
    // mouse hover
    if (!(mouseX < sx - board.lw || mouseX > sx + twb + board.lw ||
      mouseY < sy - board.lh * 1.5 || mouseY > sy + board.lh * 1.5)
    ) {
      fill(GREY)
      if (mouseIsPressed) {
        if (mouseJustPressed && !startPressed) {
          startPressed = true
          fill(WHITE)
          sst = - sstThreshMult * board.cols
          new Notification(
            () => {
              noStroke()
              text(title, titleX, tty)
              text(s, sx, sy)
            }, 5,
            [
              WHITE,
              MID_GREY,
              MID_GREY,
              DARK_GREY,
              DARK_GREY,
            ]
          )
          return
        } else {
          fill(DARK_GREY)
        }
      }
    } else {
      fill(WHITE)
    }
    if (sst > 0) {
      text(s, sx, sy)
    }
    sst += 1
    // ssns.forEach(n => { n.draw() });
  } else {
    // game has started
    if (justStarted) {
      mainTheme.play()
      justStarted = false
    }
  }

  // let fr = frameRate()
  let change = false
  // text(fr, 5,30)
  // if (!slowDown) {
  //   if (fr < 30*.95) {
  //     frameRateT += 1
  //   } else {
  //     frameRateT = max(frameRateT - .5, 0)
  //   }
  //   if (frameRateT >= frameRateTimer) {
  //     slowDown = true
  //     frameRate(15)
  //     frameRateT = 0
  //   }
  // } else {
  //   if (fr >= 15*.95) {
  //     frameRateT += 1
  //   } else {
  //     frameRateT = max(frameRateT - .5, 0)
  //   }
  //   if (frameRateT >= frameTryAgainTime) {
  //     slowDown = false
  //     frameRate(30)
  //     frameRateT = 0
  //   }
  // }
  let yratio = (board.lw + board.lwp) / (board.lh + board.lhp)

  let munstr = `[muns:${muns}]`
  let scolor = null

  let munFlash = ~~munsUp
  munsUp = max(munsUp - 1, 0)
  if (prevMs < muns - 100) {
    cht = true
  }

  // let s = title
  if (restartTimer > 0) {
    restartTimer -= 1
    title = '> press enter twice to start anew <'
    if (restartPressedTimes > 2) {
      setup(true)
    }
  } else {
    title = 'a tiny prospector.'
    if (tools[tools.length - 1].lvl == tools[tools.length - 1].maxLvl) {
      title = tools[tools.length - 1].maxPhrase
    }
    restartPressedTimes = 0
  }
  if (cht) {
    if (title == tools[tools.length - 1].maxPhrase) {
      title = 'link, the cheater, destroyer of games.'
    } else {
      title = 'link, the cheater.'
    }
  }

  // draw top title only if not on start screen
  if (!startScreen) {
    setTitleDims(title)
    fill(GREY)
    text(title, titleX, titleY)
    fill(WHITE)
  }

  if (sst == -1) {
    startScreen = false
    sst = 0
    titleNotify()
  }

  if (sst >= 0) {
    notifications.forEach(n => { n.draw() });
  }

  if (startScreen && sst >= 0) {
    return
  }


  // mouse
  let flw = board.lw + board.lwp
  let flh = board.lh + board.lhp

  // mouse pressed moved up before start menu
  // if (mouseJustPressed) {
  //   mouseJustPressed = false
  //   mouseLetGo = false
  // } else {
  //   if (mouseLetGo && mouseIsPressed) {
  //     mouseJustPressed = true
  //     mouseLetGo = false
  //   }
  //   if (!mouseIsPressed) {
  //     mouseLetGo = true
  //   }
  // }

  // if (startScreen) {return}

  // shop
  if (!startScreen) {
    for (let i = 0; i < upgrades.length; i++) {
      let upg = upgrades[i]
      let xPad = ((board.cols / 2) / upgrades.length - 1) * flw
      let x = board.hpad + xPad + (flw * 2 + xPad * 2) * i
      let y = board.vpad + board.h + flh * 3
      let costC = DARK_GREY
      if (upg.lvl >= upg.maxLvl) {
        costC = color(0, 0, 0, 0)
      }
      if (mouseX >= x - board.lwp * 2 && mouseX <= x + flw * 2 + board.lwp &&
        mouseY + flh >= y - board.lhp && mouseY + flh <= y + flh * 3) {
        costC = WHITE
        if (muns < upg.cost) {
          costC = PINK
        }
        if (mouseJustPressed) {
          // no need to draw
          costC = color(0, 0, 0, 0)
          if (muns >= upg.cost && upg.lvl < upg.maxLvl) {
            muns -= upg.cost
            upg.buy()
            saveCounter = saveEvery
            change = true
          }
        } else if (upg.lvl < upg.maxLvl) {
          upg.lvl += 1
          upg.draw(x, y)
          upg.lvl -= 1
        } else {
          costC = color(0, 0, 0, 0)
          upg.draw(x, y)
        }
      } else {
        upg.draw(x, y)
      }
      let s = `${upg.cost}`
      let sl = s.length - 2
      x -= flw * (~~(sl / 2) + sl % 2)
      fill(costC)
      text(s, x, y + flh * 2)
      if (i > 0 && upg.lvl <= 1) {
        break
      }
    } //end shop
  }
  // mouse + cam
  let mxrange = [board.hpad + flw, board.hpad + board.w - board.lw]
  let myrange = [board.vpad + flh, board.vpad + board.h - board.lh]
  let msx = constrain(mouseX, mxrange[0], mxrange[1])
  let msy = constrain(mouseY, myrange[0], myrange[1])

  let mxi = map(msx,
    mxrange[0], mxrange[1],
    1, board.cols - 1,
    true)
  let myi = map(msy,
    myrange[0], myrange[1],
    1, board.rows - 1,
    true)
  let mxc = map(mxi, 1, board.cols - 1, -1, 1)
  let myc = map(myi, 1, board.rows - 1, -1, 1)
  if (wagon.lvl > 0 &&
    mouseX >= mxrange[0] && mouseX <= mxrange[1] &&
    mouseY >= myrange[0] && mouseY <= myrange[1] &&
    (
      (mxc > .5 && cam.x < cam.maxX) ||
      (mxc < -.5 && cam.x > cam.minX) ||
      (myc > .5 && cam.y < cam.maxY) ||
      (myc < -.5 && cam.y > cam.minY)
    )
  ) {
    cam.nudge(mxc, myc)
  } else {
    cam.dx *= .99
    cam.dy *= .99
  }
  cam.update()
  shake.update()

  munAddPopup.update()
  munAddPopup.draw(((`${muns}`).length - (`${munAddPopup.value}`.length)) * flw)

  fill(WHITE)

  // text(`mxc: ${mxc}, ${myc}`,2,30)
  // text(`camx: ${cam.x},${cam.y}`,2,60)
  // text(`camdx: ${cam.dx},${cam.dy}`,2,90)

  mxi = ~~mxi
  myi = ~~myi
  let item;
  let dirt;

  if (!dmunge && random() < deathT / deathRestartT - random() * .5) {
    dmunge = true
    dumngeN = ~~map(random(), 0, 1, 0, munges.length)
    dmungeT = random() * 6 + 2
  }
  if (dmunge) {
    dmungeT -= 1
    if (dmungeT <= 0) {
      dmunge = false
    }
  }

  let xxi
  let yyi
  let borderDraw = false
  let [dtx, dty] = wagon.dontDraw()
  for (let ji = 0; ji < board.rows; ji++) {
    // put border above larger dirts
    let yi = (ji + 1) % board.rows
    //y = (lh + lhp)*(yi+1)
    for (let xi = 0; xi < board.cols; xi++) {
      let c = ' '
      //x = (lw + lwp)*xi
      // XXXXX BORDER XXXXX
      if (yi == 0 || yi == board.rows - 1 || xi == 0 || xi == board.cols - 1) {
        xxi = -1
        yyi = -1
        borderDraw = true
        c = 'X'
        scolor = WWHITE
        // muns
        let rmunstr = munstr
        if (dmunge) {
          rmunstr = '[' + munges[dumngeN] + `:${muns}]`
        }
        if (yi == 0 && xi > 0 && xi <= rmunstr.length) {
          c = rmunstr[xi - 1]
          if (munFlash > 0) {
            // print(munFlash-1)
            scolor = munFlashPal[min(munFlash - 1, munFlashPal.length - 1)]
            // scolor = YELLOW
          } else {
            scolor = WHITE
          }
        } else {
          if (death && random() < deathT / deathRestartT - random()) {
            let rc = '-~  %#@*=/\\ '
            c = rc[~~map(random(), 0, 1, 0, rc.length)]
          }
        }
        // \muns
        // XXXXXXXXXXXXXXXXXX
      }
      else {
        borderDraw = false
        // *** game screen ***

        xxi = ~~min(cam.x, world.cols - board.cols + 1) + xi
        yyi = ~~min(cam.y, world.rows - board.rows + 1) + yi
        dirt = world.get(xxi, yyi)
        if (!dirt) {
          c = ' '
          scolor = WHITE
        } else if (dirt.revealed) {
          item = dirt.revealed.item
          c = item.symbol
          scolor = item.color
          item.update()
        } else {
          c = dirt.symbol
          scolor = dirt.color
        }
        if (mxi == xi && myi == yi) {
          if (mouseJustPressed) {
            // scolor = GREY
            let wasTopSoil = dirt.topSoil
            let prevLvl = dirt.depth
            // console.log('revealed',dirt.revealed && dirt.revealed.item)
            let collected = dirt.revealed && dirt.revealed.item.allUncovered
            let prevMuns = muns
            if (collected) {
              item = dirt.revealed.item
              let value = item.collect()
              muns += value
              munsUp += item.flashColor
              munAddPopup.popup(value, item.color)
              if (value > 10) {
                saveCounter = saveEvery
              }
              change = true
            }
            for (let i = 0; i < tools.length; i++) {
              let tool = tools[i]
              if (tool.canDig(dirt)) {
                // console.log(tool.symbol, 'can dig. using that.')
                item = tool.dig(xxi, yyi)
                if (!item && collected) {
                  dirt.dig()
                }
                change = true
                break
              }
            }
            if (item) {
              // print('found')
              item = item.item
              c = item.symbol
              scolor = item.color
            } else {
              if (prevLvl != dirt.depth) {
                let val = 1
                if (prevLvl >= STONE_AT && !wasTopSoil) { val = 2 }
                if (prevLvl >= DEEP_AT) { val = 5 }
                prevMs += val
                muns += val
                munsUp += val
                munAddPopup.popup(val, ORANGE)
                change = true
              } else {
                c = dirt.symbol
                scolor = dirt.color
              }

            }
            if (prevMuns === 0 && muns > prevMuns) {
              // first time digging
              if (firstMuns) {
                new Notification(
                  () => {
                    let s = 'digs.'
                    text(s, board.hpad + (~~(board.cols / 2 - (s.length - 1) / 2)) * (board.lw + board.lwp), titleY + board.lh + board.lhp * 7)
                    fill(BACKGROUND)
                    noStroke()
                    if (title[title.length - 1] == '.') {
                      rect(titleX + textWidth(title) - textWidth('.'), titleY + board.lhp, textWidth('.'), -(board.lh + board.lhp))
                    }
                  }, 80
                )
                firstMuns = false
              }
            }
            shake.shake()
          } else {
            scolor = WHITE
          }
        }
        // *******************
      }
      // if (item || (dirt && dirt.revealed)) {
      //   text(`${scolor}`,5,30)
      // }
      // console.log(scolor)
      let drawBoard = true
      if (wagon.lvl > 1) {
        // console.log(dtx,xxi,dty,yyi)
        if ((dtx == xi && dty == yi) ||
          (dtx + wagon.dDeltas[wagon.dir][0] == xi &&
            dty + wagon.dDeltas[wagon.dir][1] == yi)) {
          drawBoard = false
        }
      }
      if (drawBoard || borderDraw) {
        try {
          board.write(c, xi, yi, scolor)
        } catch (error) {
          console.log(scolor)
        }
      }

      // console.log(change)
      // text(munFlash, 5, 30)
    }
  }
  if (wagon.lvl > 1) {
    wagon.drawc()
    change = change || wagon.updatec()
  }

  // starting game transition
  if (sst < 0) {
    noStroke()
    fill(BACKGROUND)
    for (let ri = 0; ri < board.rows; ri++) {
      let y = board.vpad + (board.lh + board.lhp) * (board.rows-ri-1)
      let x = board.hpad + (board.lw + board.lwp) * ri + board.w + ((sst*2-.5*sst)*2/sstThreshMult) * (board.lw + board.lwp)
      let xe = board.hpad + board.w
      if (x < xe) {
        rect(x,y+1,board.hpad+board.w-x,board.lh+board.lhp)
      }
    }
  }

  //notifications in front of start transition
  if (sst < 0) {
    notifications.forEach(n => { n.draw() });
  }
  
  if (change) {
    // console.log(change)
    saveCounter += 1
    if (saveCounter >= saveEvery) {
      saveCounter = 0
      memoryCard.save()
    }
  }
  // ellipse(msx,msy,5,5)
}