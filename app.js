/* globals typer */
let startButton
let playerName

const TYPER = function () {
  if (TYPER.instance_) {
    return TYPER.instance_
  }
  TYPER.instance_ = this

  this.WIDTH = window.innerWidth
  this.HEIGHT = window.innerHeight
  this.canvas = null
  this.ctx = null
  this.words = []
  this.word = null
  this.wordMinLength = 5
  this.guessedWords = 0
  this.score = 0
  this.hits = 0
  this.misses = 0
  this.timer = null
  this.difficultyMenu = null

  this.init()
}

window.TYPER = TYPER

TYPER.prototype = {
  init: function () {
    this.canvas = document.getElementsByTagName('canvas')[0]
    this.ctx = this.canvas.getContext('2d')

    this.canvas.style.width = this.WIDTH + 'px'
    this.canvas.style.height = this.HEIGHT + 'px'

    this.canvas.width = this.WIDTH * 2
    this.canvas.height = this.HEIGHT * 2

    this.difficultyMenu = document.getElementsByName('difficulty')
    for (let i = 0; i < this.difficultyMenu.length; i++) {
      if (this.difficultyMenu[i].checked) {
        this.difficulty = this.difficultyMenu[i].value
      }
    }
    if (this.difficulty === 'easy') {
      this.timer = 30
    } else if (this.difficulty === 'medium') {
      this.timer = 20
    } else if (this.difficulty === 'hard') {
      this.timer = 10
    }
    this.timer = setInterval(this.timerChange(this.timer), 1000)
    this.loadWords()
  },
  loadWords: function () {
    const xmlhttp = new XMLHttpRequest()

    xmlhttp.onreadystatechange = function () {
      if (xmlhttp.readyState === 4 && (xmlhttp.status === 200 || xmlhttp.status === 0)) {
        const response = xmlhttp.responseText
        const wordsFromFile = response.split('\n')

        typer.words = structureArrayByWordLength(wordsFromFile)

        typer.start()
      }
    }

    xmlhttp.open('GET', './lemmad2013.txt', true)
    xmlhttp.send()
  },
  start: function () {
    this.generateWord()
    this.word.Draw()

    window.addEventListener('keypress', this.keyPressed.bind(this))
  },
  timerChange: function (timer) {
    let currTime = timer
    currTime -= 1
    console.log('tick: ' + currTime)
    return currTime
  },
  generateWord: function () {
    const generatedWordLength = this.wordMinLength + parseInt(this.guessedWords / 5)
    const randomIndex = (Math.random() * (this.words[generatedWordLength].length - 1)).toFixed()
    const wordFromArray = this.words[generatedWordLength][randomIndex]
    const scoreVal = generatedWordLength * 25
    console.log(scoreVal)
    this.word = new Word(wordFromArray, this.canvas, this.ctx, scoreVal)
  },

  keyPressed: function (event) {
    const letter = String.fromCharCode(event.which)

    if (letter === this.word.left.charAt(0)) {
      this.word.removeFirstLetter()
      this.hits += 1
      console.log(this.hits)

      if (this.word.left.length === 0) {
        this.guessedWords += 1
        this.score += this.word.scoreVal
        this.generateWord()
      }

      this.word.Draw()
    } else {
      this.score -= 25
      this.misses += 1
      console.log(this.misses)
    }
  }
}

/* WORD */
const Word = function (word, canvas, ctx, scoreVal) {
  this.word = word
  this.left = this.word
  this.canvas = canvas
  this.ctx = ctx
  this.scoreVal = scoreVal
}

Word.prototype = {
  Draw: function () {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.ctx.textAlign = 'center'
    this.ctx.font = '140px Courier'
    this.ctx.fillText(this.left, this.canvas.width / 2, this.canvas.height / 2)

    this.ctx.fillStyle = 'black'
    this.ctx.textAlign = 'left'
    this.ctx.font = '40px Arial'
    this.ctx.fillText(typer.score, 100, 100)
  },

  removeFirstLetter: function () {
    this.left = this.left.slice(1)
  }
}

/* HELPERS */
function structureArrayByWordLength (words) {
  let tempArray = []

  for (let i = 0; i < words.length; i++) {
    const wordLength = words[i].length
    if (tempArray[wordLength] === undefined)tempArray[wordLength] = []

    tempArray[wordLength].push(words[i])
  }

  return tempArray
}
function startGame () {
  playerName = document.getElementById('playerName').value
  if (playerName !== null) {
    document.getElementById('startPage').style.display = 'none'
    document.getElementById('canvas').style.display = 'block'
    const typer = new TYPER()
    window.typer = typer
  }
}
window.onload = function () {
  startButton = document.getElementById('startButton')
  startButton.addEventListener('click', startGame)
}
