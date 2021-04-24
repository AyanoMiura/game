"use strict";

//////////////////////////////////////
//  エラー回避 移植しちゃだめ
function pgame_fw_ad_popup() {
  console.log("Advertisement");
}

function Game() {
  var _gameManager = new GameManager(this, stage);
  _gameManager.sceneChange(this.SceneList.TOP);

  this.gameManager = function () {
    return _gameManager;
  };
}

Game.prototype.SceneList = {
  TOP: "Top",
  PLAY: "play",
  GAME: "Game",
  RESULT: "Result",
};

Game.prototype.scenes = {
  Top: function (gameManager) {
    //PC:0 SP:1　PCとSPの処理分け用
    const isSP = type;
    console.log("Top");
    //遷移させたいシーンを渡すことで切り替える
    //gameManager.sceneChange(gameManager.game().SceneList.GAME);

    //ゲームのプレイカウント+1　ゲームスタート時やリトライ時に呼ぶ
    // gameManager.game().gameStart();

    //スコア登録　ゲーム終了時にスコアを渡す
    //gameManager.game().gameEnd(score);

    //FB投稿用のイメージを渡すことでFB投稿ができる
    //gameManager.game().pgameImageUpload(container, function(responseData) {

    //  gameManager.game().pgameFacebookShare( responseData.imageUrl, responseData.gameUrl, 'あなたのスコアは' + score + '点でした', "Temp");
    //});

    const sceneContainer = new createjs.Container();
    // sceneContainer.addEventListener("click", function () {
    //   gameManager.sceneChange(gameManager.game().SceneList.GAME);
    // });

    const Top = new lib.top();
    sceneContainer.addChild(Top);
    Top.top_button.addEventListener("click", function () {
      gameManager.sceneChange(gameManager.game().SceneList.GAME);
    });
    Top.play_button.addEventListener("click", function () {
      gameManager.sceneChange(gameManager.game().SceneList.PLAY);
    });

    return sceneContainer;
  },

  play: function (gameManager) {
    //PC:0 SP:1　PCとSPの処理分け用
    const isSP = type;
    console.log("playGame");

    const sceneContainer = new createjs.Container();
    const playGame = new lib.playGame();
    sceneContainer.addChild(playGame);
    playGame.top_button.addEventListener("click", function () {
      gameManager.sceneChange(gameManager.game().SceneList.GAME);
    });
    return sceneContainer;
  },

  Game: function (gameManager) {
    //PC:0 SP:1　PCとSPの処理分け用
    const isSP = type;
    console.log("Game");
    const posObj = function (posX, posY) {
      this.x = posX;
      this.y = posY;
    };

    const sceneContainer = new createjs.Container();
    const gameSheet = new lib.game();
    sceneContainer.addChild(gameSheet);

    const fireList = []; //砲弾
    const leftList = []; //左から出てくる火の玉
    const rightList = []; //右から出てくる火の玉
    //火の玉
    const balls = [
      [lib.greenBall, "green"],
      [lib.redBall, "red"],
      [lib.yellowBall, "yellow"],
    ];

    //レベルアップ

    const levelUpArr = [];

    //出た玉の色を格納
    const leftColor = [];
    const rightColor = [];
    //花火の配列
    const fireWorks = [];
    //フレームの番号
    let count = 0;
    //レベルアップ
    let levelUpCount = 0;
    let levelUpHitCount = 0;
    let levelFlag = true;
    //スコア
    let scoreNum = 0;
    //当たり判定コンボスコア変数
    let comboNum = 0;
    let scoreComboNum = 100;
    //リザルトに渡す変数
    gameManager.score = 0;

    //タイマー
    const number = 60;
    const timer = new gameManager.game().TextField(number, lib.countNumber);
    timer.x = 10;
    timer.y = 10;
    gameSheet.addChild(timer);
    let dt = new Date(); //スタートした時刻
    let endDt = new Date(dt.getTime() + number * 1000); //終了時刻＝開始日時のミリ秒＋カウントしたいミリ秒
    let cnt = number;
    let timeId = setInterval(function () {
      cnt--;
      timer.text(cnt);
      dt = new Date(); //現在時刻を取得
      if (dt.getTime() >= endDt.getTime()) {
        // 現在日時と終了日時を比較
        clearInterval(timeId);
        //タイムアップ
        tickerStop();
        console.log("finish");
      }
    }, 1000);

    //スコア表示
    const score = new gameManager.game().TextField(scoreNum, lib.countNumber);
    score.x = 500;
    score.y = 10;
    gameSheet.addChild(score);
    gameManager.score = scoreNum;

    //event
    createjs.Ticker.addEventListener("tick", handleTick);
    gameSheet.addEventListener("click", handleClick);

    /*-----------------------clickアクション、キーイベント------------------------ */

    let clickFlag = true;
    function handleClick() {
      if (clickFlag == true) {
        goFire(levelUpHitCount);
        clickFlag = false;
        gameSheet.removeEventListener("click", handleClick);
      }
      setTimeout(function () {
        clickFlag = true;
        gameSheet.addEventListener("click", handleClick);
      }, 700);
    }

    //enterキーのイベント //玉増えた時の処理直す
    addEventListener("keydown", keydown);
    function keydown(event) {
      let ck = event.keyCode;
      if (ck === 13) {
        goFire(levelUpHitCount);
        removeEventListener("keydown", keydown);
      }
      setTimeout(function () {
        addEventListener("keydown", keydown);
      }, 500);
    }
    /*---------------------clickアクション、キーイベント終わり---------------------- */

    //大砲
    const gun1 = new lib.gun();
    const gun2 = new lib.gun();
    const gun3 = new lib.gun();
    gun1.x = 270;
    gun1.y = 375;
    gameSheet.addChild(gun1);

    //大砲の火
    function goFire(num) {
      for (let i = -1; i < num; i++) {
        if (num < 3) {
          const fire = new lib.fire();
          switch (num) {
            case 0:
              fire.x = 360 + i * 80;
              break;
            case 1:
              fire.x = 310 + i * 80;
              break;
            case 2:
              fire.x = 280 + i * 70;
              break;
          }
          fire.y = 365;
          gameSheet.addChild(fire);
          fireList.push(fire);
          fire.gotoAndStop(0);
          createjs.Tween.get(fire).to({ y: -30 }, 700);
        }
      }
      console.log("gun");
    }

    /*---------------------handleTick---------------------*/
    function handleTick() {
      appearFireBall();
      hitBall();
      hitCombo();
      //画面端まで行ったら削除
      for (let i = 0; i < fireList.length; i++) {
        if (fireList[i].y < 0) {
          gameSheet.removeChild(fireList[i]);
          fireList.splice(i, 1);
          // console.log(fireList);
        }
      }
      for (let i = 0; i < leftList.length; i++) {
        for (let j = 0; j < leftColor.length; j++) {
          if (leftList[i]) {
            if (leftList[i].x > 680) {
              gameSheet.removeChild(leftList[i]);
              leftList.splice(i, 1);
              leftColor.splice(j, 1);
            }
          }
        }
      }
      for (let i = 0; i < rightList.length; i++) {
        for (let j = 0; j < leftColor.length; j++) {
          if (rightList[i]) {
            if (rightList[i].x < -10) {
              gameSheet.removeChild(rightList[i]);
              rightList.splice(i, 1);
              rightColor.splice(j, 1);
            }
          }
        }
      }
      for (let i = 0; i < levelUpArr.length; i++) {
        if (levelFlag === true) {
          if (levelUpArr[i].x > 680) {
            gameSheet.removeChild(levelUpArr[i]);
            levelUpArr.splice(i, 1);
            // console.log("レベル", levelUpArr);
          }
        } else {
          if (levelUpArr[i].x < -10) {
            gameSheet.removeChild(levelUpArr[i]);
            levelUpArr.splice(0, 1);
            // console.log("レベル", levelUpArr);
          }
        }
      }

      stage.update();
    }
    /*---------------------handleTick終わり-----------------*/

    //火の玉の出現、５０シーンごとに繰り返す
    function appearFireBall() {
      count++;
      if (count % 50 == 0) {
        //左から
        for (let i = 0; i < 2; i++) {
          const num = Math.floor(Math.random() * 3);
          if (randomBall() > 1) {
            const ballLeft = new balls[num][0]();
            ballLeft.x = -20;
            ballLeft.y = 50 + i * 80;
            gameSheet.addChild(ballLeft);
            createjs.Tween.get(ballLeft).to({ x: 700 }, speedBall());
            ballLeft.gotoAndStop(0);
            leftList.push(ballLeft);
            //2次元配列を格納
            leftColor.push(balls[num]);
          }
        }
        //右から
        for (let i = 0; i < 3; i++) {
          const num2 = Math.floor(Math.random() * 3);
          if (randomBall() > 1) {
            const ballRight = new balls[num2][0]();
            ballRight.x = 620;
            ballRight.y = 100 + i * 60;
            gameSheet.addChild(ballRight);
            createjs.Tween.get(ballRight).to({ x: -40 }, speedBall());
            ballRight.gotoAndStop(0);
            rightList.push(ballRight);
            //2次元配列を格納
            rightColor.push(balls[num2]);
          }
        }
      }

      // レベルアップ玉の表示
      if (count % 100 == 0) {
        let countNum = levelUpCount % 2 === 0;
        const levelUp = new lib.levelUp();
        levelUp.x = countNum ? -20 : 700;
        levelUp.y = countNum ? 100 : 250;
        gameSheet.addChild(levelUp);
        levelUp.gotoAndStop(0);
        levelUpArr.push(levelUp);

        countNum
          ? createjs.Tween.get(levelUp).to({ x: 700 }, 4000)
          : createjs.Tween.get(levelUp).to({ x: -20 }, 4000);
        levelFlag = countNum ? true : false;
        levelUpCount++;
      }
    }

    //火の玉色をランダムで出現
    function randomBall() {
      return Math.floor(Math.random() * (3 - 1)) + 1;
    }

    //火の玉速さ
    function speedBall() {
      return Math.floor(Math.random() * (5000 + 1000 - 1500)) + 1500;
    }

    //火の玉と弾丸のあたり判定
    function hitBall() {
      //ballのあたり判定、左
      for (let i = 0; i < leftList.length; i++) {
        for (let j = 0; j < fireList.length; j++) {
          // console.log("leftList[i]", leftList[i]);
          if (checkHit(leftList[i], fireList[j])) {
            gameSheet.removeChild(fireList[j]);
            fireList.splice(j, 1);
            gameSheet.removeChild(leftList[i]);
            //花火
            fireWorksColor(leftColor[i][1], leftList[i]);
            leftList.splice(i, 1);
            leftColor.splice(i, 1);
            //スコア加算
            scoreCalc();
          }
        }
      }

      //ballのあたり判定、右
      for (let i = 0; i < rightList.length; i++) {
        for (let j = 0; j < fireList.length; j++) {
          // console.log(checkHit(rightList[i], fireList[j]));
          if (checkHit(rightList[i], fireList[j])) {
            gameSheet.removeChild(fireList[j]);
            fireList.splice(j, 1);
            gameSheet.removeChild(rightList[i]);
            //花火
            fireWorksColor(rightColor[i][1], rightList[i]);
            // console.log(rightList, rightColor);
            rightList.splice(i, 1);
            rightColor.splice(i, 1);

            //スコア加算
            scoreCalc();
          }
        }
      }

      // レベルアップのあたり判定
      levelUpFunc(levelUpArr, fireList);
    }

    //当たり判定combo
    function hitCombo() {
      // ballと花火のあたり判定,左
      for (let i = 0; i < leftList.length; i++) {
        for (let j = 0; j < fireWorks.length; j++) {
          // console.log("花火", fireWorks[j]);
          // console.log(`i: ${i}, j: ${j}`);
          // console.log("ボール", leftList[i]);
          // console.log(fireWorks);
          if (checkHit(leftList[i], fireWorks[j])) {
            // console.log("ボール", leftList[i]);
            gameSheet.removeChild(leftList[i]);
            fireWorksColor(leftColor[i][1], leftList[i]);
            leftList.splice(i, 1);
            leftColor.splice(i, 1);

            //コンボ加算
            comboNum += 1;
            comboScoreCalc(comboNum);
            console.log("Hit.combo!");
            console.log("コンボ", scoreNum);
          }
        }
      }

      // ballと花火のあたり判定,右
      for (let i = 0; i < rightList.length; i++) {
        for (let j = 0; j < fireWorks.length; j++) {
          // console.log("花火", fireWorks[j]);
          // console.log(`i: ${i}, j: ${j}`);
          // console.log("ボール", rightList[i]);
          // console.log(fireWorks);
          // console.log("花火", fireWorks[j]);
          if (checkHit(rightList[i], fireWorks[j])) {
            // console.log("ボール", rightList[i]);
            gameSheet.removeChild(rightList[i]);
            fireWorksColor(rightColor[i][1], rightList[i]);
            rightList.splice(i, 1);
            rightColor.splice(i, 1);

            //コンボ加算
            comboNum += 1;
            comboScoreCalc(comboNum);
            console.log("Hit.combo!");
          }
        }
      }

      //レベルアップ
      levelUpFunc(levelUpArr, fireWorks);
    }

    //スコア加算
    function scoreCalc() {
      scoreNum += 100;
      score.text(scoreNum);
      gameManager.score = scoreNum;
      // console.log(scoreNum);
    }

    //コンボの加算
    function comboScoreCalc() {
      scoreComboNum = scoreComboNum * 2;
      scoreNum += scoreComboNum;
      score.text(scoreNum);
      gameManager.score = scoreNum;
      // console.log(scoreNum);
    }

    //花火の色をチェックしadd
    function fireWorksColor(color, pos) {
      let choiceColor;
      if (color === "green") {
        choiceColor = new lib.fireWorksGreen();
      } else if (color === "red") {
        choiceColor = new lib.fireWorksRed();
      } else if (color === "yellow") {
        choiceColor = new lib.fireWorksYellow();
      }

      choiceColor.x = pos.x;
      choiceColor.y = pos.y;
      gameSheet.addChild(choiceColor);
      fireWorks.push(choiceColor);
      choiceColor.loop = false;
      choiceColor.gotoAndPlay();
      // choiceColor.gotoAndStop(0);

      // let num=10;
      // if(choiceColor.gotoAndPlay(num)  ){
      // choiceColor.gotoAndStop(10);
      // }
      createjs.Tween.get(choiceColor).to({ alpha: 0 }, 500).call(remove);
      function remove() {
        gameSheet.removeChild(choiceColor);
        fireWorks.splice(0, 1);
      }
      return choiceColor;
    }

    //レベルアップ文字表示
    const levelUpLetterArr = [];
    function levelUpDisplay(pos) {
      const levelUpLetter = new lib.levelUpLetter();
      levelUpLetter.x = pos.x;
      levelUpLetter.y = pos.y;
      gameSheet.addChild(levelUpLetter);
      levelUpLetterArr.push(levelUpLetter);

      createjs.Tween.get(levelUpLetter)
        .to({ alpha: 0 }, 1000)
        .call(removeLevelUp);
      function removeLevelUp() {
        for (let i = 0; i < levelUpLetterArr.length; i++) {
          gameSheet.removeChild(levelUpLetter[i]);
          levelUpLetterArr.splice(i, 1);
        }
      }
    }

    //レベルアップの関数
    function levelUpFunc(levelUp, fire) {
      for (let i = 0; i < levelUp.length; i++) {
        for (let j = 0; j < fire.length; j++) {
          if (checkHit(levelUp[i], fire[j])) {
            gameSheet.removeChild(fire[j]);
            fire.splice(j, 1);
            gameSheet.removeChild(levelUp[i]);
            levelUpDisplay(levelUp[i]);

            //大砲追加
            if (levelUpHitCount < 2) {
              levelUpHitCount++;
            } else {
              levelUpHitCount = 2;
            }
            switch (levelUpHitCount) {
              case 1:
                gun1.x = 300;
                gun1.y = 375;
                gun2.x = 220;
                gun2.y = 375;
                gameSheet.addChild(gun2);
                break;
              case 2:
                // levelUpDisplay(levelUp[i]);
                gun1.x = 330;
                gun1.y = 375;
                gun2.x = 270;
                gun2.y = 375;
                gun3.x = 210;
                gun3.y = 375;
                gameSheet.addChild(gun3);
                break;
              default:
                scoreCalc();
                break;
            }

            levelUp.splice(i, 1);
            console.log("levelUp!");
          }
        }
      }
    }

    //あたり判定のチェック
    function checkHit(ballGetBounds, fireGetBounds) {
      // console.log("bounds", ballGetBounds.x);

      let left1 = 0;
      let right1 = 0;
      let top1 = 0;
      let bottom1 = 0;

      if (ballGetBounds) {
        left1 = ballGetBounds.x;
        right1 = left1 + ballGetBounds.getBounds().width;
        top1 = ballGetBounds.y;
        bottom1 = top1 + ballGetBounds.getBounds().height;
      }
      // console.log(fireGetBounds);
      let left2 = 0;
      let right2 = 0;
      let top2 = 0;
      let bottom2 = 0;
      if (fireGetBounds) {
        left2 = fireGetBounds.x;
        // if(fireGetBounds.getBounds().width===null){
        // console.log("width", fireGetBounds);
        // }
        right2 = left2 + fireGetBounds.getBounds().width;
        top2 = fireGetBounds.y;
        bottom2 = top2 + fireGetBounds.getBounds().height;
      }

      console.group("あたり判定チェック");
      console.log(left1 <= right2 && right1 >= left2);
      console.log(bottom1 >= top2 && top1 <= bottom2);
      console.groupEnd();
      if (ballGetBounds && fireGetBounds) {
        if (left1 <= right2 && right1 >= left2) {
          if (bottom1 >= top2 && top1 <= bottom2) {
            return true;
          } else {
            return false;
          }
        }
      }
    }

    //タイムアップの文字
    const timeUp = new lib.timeUp();
    gameSheet.addChild(timeUp);
    timeUp.x = 0;
    timeUp.y = -480;

    //タイムアップ
    function tickerStop() {
      createjs.Ticker.removeEventListener("tick", handleTick);
      gameSheet.removeEventListener("click", handleClick);
      removeEventListener("keydown", keydown);
      //火の玉非表示
      for (let i = 0; i < leftList.length; i++) {
        leftList[i].visible = false;
      }
      for (let i = 0; i < rightList.length; i++) {
        rightList[i].visible = false;
      }
      //levelup玉の非表示
      for (let i = 0; i < levelUpArr.length; i++) {
        levelUpArr[i].visible = false;
      }

      //タイムアップ表示
      createjs.Tween.get(timeUp)
        .to({ y: -50 }, 300, createjs.Ease.bounceOut)
        .wait(1500)
        .call(timeUpPage);
      function timeUpPage() {
        gameManager.sceneChange(gameManager.game().SceneList.RESULT);
      }
    }

    // gameSheet.addEventListener("click", function () {
    //   gameManager.sceneChange(gameManager.game().SceneList.RESULT);
    // });

    return sceneContainer;
  },

  Result: function (gameManager) {
    //PC:0 SP:1　PCとSPの処理分け用
    const isSP = type;
    console.log("Result");
    const sceneContainer = new createjs.Container();
    const result = new lib.result();
    sceneContainer.addChild(result);

    //スコア表示
    const totalScore = new gameManager.game().TextField(
      gameManager.score,
      lib.countNumber
    );
    totalScore.x = 240;
    totalScore.y = 180;
    result.addChild(totalScore);

    //SNS投稿用
    var strScore = "打ち上げ花火で " + totalScore + "点を獲得！";
    var gameUrl = "https://www.p-game.jp/game276/";
    //twitter
    result.twitterButton.addEventListener("click", function () {
      var strTwitter = strScore;
      var urlTwitter = gameUrl;
      if (strTwitter != "") {
        if (strTwitter.length > 140) {
          console.log("テキストが140字を超えています");
        } else {
          // 投稿画面を開く
          urlTwitter =
            "http://twitter.com/share?url=" +
            escape(gameUrl) +
            "&text=" +
            strTwitter +
            "&hashtags=プチゲーム,無料ゲーム,アクション,打ち上げ花火" +
            " & related=pgame_jp";
          window.open(urlTwitter, "_blank", "width=600,height=400");
        }
      }
    });

    //line.....サーバーにあげたら確認
    result.lineButton.addEventListener("click", function () {
      pgame_fw_line_share(location.href);
    });

    result.retry_button.addEventListener("click", function () {
      gameManager.sceneChange(gameManager.game().SceneList.GAME);
    });

    return sceneContainer;
  },
};

// 各数字の文字間隔で横幅を調整できるVer
Game.prototype.TextField = function (text, mc, origin, adjustW) {
  var _textBase = new createjs.Container();
  var _textSprite = new createjs.Container();
  var _mc = mc;
  var _origin = origin;

  _textBase.addChild(_textSprite);
  _textBase.text = createText;

  var _texts = [];

  //文字幅
  var dummy = new _mc();
  dummy.gotoAndStop(0); // getBounds するために大事
  var NUM_WIDTH = dummy.getBounds().width + adjustW; // 文字調整用

  createText(text);

  function createText(textValue) {
    var str = textValue + "";
    var posX = 0;

    //初期化
    _texts.forEach(function (value) {
      _textSprite.removeChild(value);
    });
    _texts = [];
    Array.prototype.forEach.call(str, function (value, index) {
      if (value == ":") {
        value = 10;
      } else if (value == ".") {
        value = 11;
      }
      var _textMc = new _mc();
      _textMc.gotoAndStop(value);
      NUM_WIDTH = _textMc.getBounds().width; // + adjustW;
      _textMc.x = posX;
      _texts.push(_textMc);
      _textSprite.addChild(_texts[index]);
      posX += NUM_WIDTH;
    });

    if (_origin == 2 || _origin == 5 || _origin == 8) {
      _textSprite.x = (-NUM_WIDTH * str.length) / 2 + adjustW / 2;
    } else if (_origin == 3 || _origin == 6 || _origin == 9) {
      _textSprite.x = -NUM_WIDTH * str.length + adjustW / 2;
    }
    if (_origin == 1 || _origin == 2 || _origin == 3) {
      _textSprite.y = -_textSprite.getBounds().height;
    } else if (_origin == 4 || _origin == 5 || _origin == 6) {
      _textSprite.y = -_textSprite.getBounds().height / 2;
    }
  }

  return _textBase;
};
