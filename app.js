/* globals typer */
let startButton
let resetButton
let playerName
let timerDebug
let gameTimer


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
  this.state = null
  this.name = null

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

    this.name = document.getElementById('playerName').value
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
    gameTimer = setInterval(function () { typer.incrementTimer() }, 1000)
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
  incrementTimer: function () {
    if (typer.timer <= 0 || this.guessedWords === 100) {
      clearInterval(timerDebug)
      clearInterval(gameTimer)
      this.accuracy = (Math.round(this.hits / (this.hits + this.misses) * 100))
      document.getElementById('canvas').style.display = 'none'
      let endName = document.getElementById('endName')
      let endScore = document.getElementById('endScore')
      let endAccuracy = document.getElementById('endAccuracy')
      let endGuessedWords = document.getElementById('endGuessedWords')
      this.table = document.getElementById('highScores')

      endName.innerHTML = 'Nimi: ' + this.name
      endScore.innerHTML = 'Skoor: ' + this.score
      endAccuracy.innerHTML = 'Täpsus: ' + this.accuracy + '%'
      endGuessedWords.innerHTML = 'Arvatud sõnad: ' + this.guessedWords

      let scoreArr = JSON.parse(localStorage.getItem('scores')) || []
      let newScore = {
        name: this.name,
        score: this.score,
        accuracy: this.accuracy,
        wordCount: this.guessedWords,
        difficulty: this.difficulty
      }
      scoreArr.push(newScore)
      localStorage.setItem('scores', JSON.stringify(scoreArr))
      scoreArr = scoreArr.sort(function (a, b) { return b.score - a.score })
      for (let i = 0; i < scoreArr.length && i < 25; i++) {
        if (scoreArr[i].difficulty === this.difficulty) {
          let tableRow = document.createElement('tr')
          let obj = scoreArr[i]
          for (let i in obj) {
            let tableCell = document.createElement('td')
            let dataNode = null
            if (i === '2') {
              dataNode = document.createTextNode(obj[i] + '%')
            } else {
              if (obj[i] === 'easy') {
                dataNode = document.createTextNode('kerge')
              } else if (obj[i] === 'medium') {
                dataNode = document.createTextNode('keskmine')
              } else if (obj[i] === 'hard') {
                dataNode = document.createTextNode('raske')
              } else {
                dataNode = document.createTextNode(obj[i])
              }
            }
            tableCell.appendChild(dataNode)
            tableRow.appendChild(tableCell)
          }
          this.table.appendChild(tableRow)
        }
      }
      document.getElementById('endPage').style.display = 'flex'
      TYPER.instance_ = null
    } else {
      typer.timer = typer.timer - 1
      this.ctx.clearRect(this.canvas.width - 200, 0, this.canvas.width, 200)
      this.ctx.fillText(typer.timer, this.canvas.width - 100, 100)
    }
  },
  start: function () {
    this.generateWord()
    this.word.Draw()
    this.ctx.fillText(this.timer, this.canvas.width - 100, 100)
    window.addEventListener('keypress', this.keyPressed.bind(this))
  },
  generateWord: function () {
    const generatedWordLength = this.wordMinLength + parseInt(this.guessedWords / 5)
    const randomIndex = (Math.random() * (this.words[generatedWordLength].length - 1)).toFixed()
    const wordFromArray = this.words[generatedWordLength][randomIndex]
    const scoreVal = generatedWordLength * 25
    this.word = new Word(wordFromArray, this.canvas, this.ctx, scoreVal)
  },

  keyPressed: function (event) {
    const letter = String.fromCharCode(event.which)

    if (letter === this.word.left.charAt(0)) {
      this.word.removeFirstLetter()
      this.hits += 1

      if (this.word.left.length === 0) {
        this.guessedWords += 1
        this.score += this.word.scoreVal
        this.timer += 1
        this.generateWord()
      }

      this.word.Draw()
    } else {
      this.score -= 25
      this.misses += 1
      this.timer--
      this.ctx.clearRect(0, 0, 400, 200)
      this.ctx.fillText(typer.score, 100, 100)
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
    this.ctx.clearRect(0, 0, 400, 200)
    this.ctx.clearRect(200, 200, this.canvas.width, this.canvas.height)
    this.ctx.textAlign = 'center'
    this.ctx.font = '140px Arial'
    this.ctx.fillText(this.left, this.canvas.width / 2, this.canvas.height / 2)

    this.ctx.fillStyle = 'black'
    this.ctx.textAlign = 'left'
    this.ctx.font = '60px Arial'
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
function reset () {
  document.getElementById('startPage').style.display = 'flex'
  document.getElementById('endPage').style.display = 'none'
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
  resetButton = document.getElementById('reset')
  startButton.addEventListener('click', startGame)
  resetButton.addEventListener('click', reset)
}



