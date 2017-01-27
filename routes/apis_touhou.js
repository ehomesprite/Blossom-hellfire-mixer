var express = require('express');
var router = express.Router();

//手牌中,用4组标记数量

//副露中,用0-9标记吃牌和碰牌的位置和玩家
//0:暗杠
//1:吃1位,上家/碰,上家
//2:吃2位,上家
//3:吃3位,上家
//4:吃1位,对家/碰,对家
//5:吃2位,对家
//6:吃3位,对家
//7:吃1位,下家/碰,下家
//8:吃2位,下家
//9:吃3位,下家

function tehai(){
	this.hai = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
	this.furo = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
	this.dora = [0,0,0,0,0,0,0,0,0,0];
	this.agariHai = null;
  this.agariFrom = null;
  this.ji = null;
  this.ba = null;
  this.chitoi = false;
  this.kokushi = false;
  this.first = false;
  this.last = false;
  this.riichi = false;
  this.ippatsu = false;
  this.rinsyan = false;
  this.double = false;
  this.chankan = false;
  this.nakashi = false;
};

var tehaiTypes = 34;

var agariCheck = function(){
  var chitoiCheck = function(tehai){
    var agari = {
      count: 0,
      result: []
    };
    var tmp = {
      type: 'chitoi',
      toi: []
    };
    tmp.toi[tehaiTypes-1] = 0;
    tmp.toi.fill(0,0,tehaiTypes);
    var toitsu = 0;
    for(var i=0;i<tehaiTypes;i++){
      if(tehai.hai[i]===2){
        toitsu++;
        tmp.toi[i] = 1;
      }
    }
    if(toitsu===7&&tehai.furoCount===0){
      tehai.chitoi = true;
      agari.count++;
      agari.result.push(tmp);
    }
    return agari;
  };
  var kokushiCheck = function(tehai){
    var agari = {
      count: 0,
      result: []
    };
    var yao = 0;
    for(var i=0;i<tehaiTypes;i++){
      if(i<27&&i%9!==0&&i%9!==8){
        continue;
      }
      if(tehai.hai[i]>0){
        yao++;
      }
    }
    if(yao===12){
      tehai.kokushi = true;
      agari.count++;
      var tmp = {
        type: 'kokushi'
      };
      agari.result.push(tmp);
    }
    return agari;
  };
  //目前的假定
  //1.和牌的面子选择每一层只选一个,选到后退出循环,重复3次,取代当前的全部递归
  var mentsuRemove = function (tehai,level,type){
    level = typeof level !== 'undefined' ? level : 1;//first time
    //按照先顺子再刻子的顺序来取牌,开始取刻后不再取顺,type===true时不再取顺
    type = typeof type !== 'undefined' ? type : false;//default value
    var agari = {
      count: 0,
      result: []
    };
    //syontsu
    if(!type){
      for(var i=0;i<tehaiTypes;i++){
        if(i%9>6||i>=27)
          continue;
        if(tehai.hai[i]>0){
          if(tehai.hai[i+1]>0){
            if(tehai.hai[i+2]>0){
              if(level!==4){
                tehai.hai[i]--;
                tehai.hai[i+1]--;
                tehai.hai[i+2]--;
                next = mentsuRemove(tehai,level+1);
                agari.count+=next.count;
                for(var k=0;k<next.result.length;k++){
                  //typeof tmp[i] === 'number' ? tmp[i]++ : 1;
                  next.result[k].syon[i]++;
                  agari.result.push(next.result[k]);
                }
                tehai.hai[i]++;
                tehai.hai[i+1]++;
                tehai.hai[i+2]++;
                break;
              }
              else{
                agari.count = 1;
                //置和牌面子标记
                var tmp = {
                  type: 'normal',
                  syon: [],
                  ko: []
                };
                tmp.syon[tehaiTypes-1] = 0;
                tmp.syon.fill(0,0,tehaiTypes);
                tmp.ko[tehaiTypes-1] = 0;
                tmp.ko.fill(0,0,tehaiTypes);
                tmp.syon[i] = 1;
                agari.result.push(tmp);
                break;
              }
            }
          }
        }
      }
    }
    //kotsu
    for(var j=0;j<tehaiTypes;j++){
      if(tehai.hai[j]>=3){
        if(level!==4){
          tehai.hai[j]-=3;
          next = mentsuRemove(tehai,level+1,true);
          agari.count+=next.count;
          for(var k=0;k<next.result.length;k++){
            //typeof tmp[i] === 'number' ? tmp[i]++ : 1;
            next.result[k].ko[j]++;
            agari.result.push(next.result[k]);
          }
          tehai.hai[j]+=3;
          break;
        }
        else{
          agari.count=1;
          //置和牌面子标记
          var tmp = {
            type: 'normal',
            syon: [],
            ko: []
          }
          tmp.syon[tehaiTypes-1] = 0;
          tmp.syon.fill(0,0,tehaiTypes);
          tmp.ko[tehaiTypes-1] = 0;
          tmp.ko.fill(0,0,tehaiTypes);
          tmp.ko[j] = 1;
          agari.result.push(tmp);
          break;
        }
      }
    }
    //if(level===1&&agari.count)console.log('result: '+JSON.stringify(agari.result)+' '+'agariCount: '+agari.count+' '+'level: '+level);
    //console.log('tehai: '+tehai.hai+' '+'agariCount: '+agari.count+' '+'level: '+level);
    return agari;
  };
  var tehaiValidator = function(data){

    //todo:
    //1:副露的范围
    //2:和牌是杠牌
    //3:根据各家牌判断和牌存不存在
    var tehai;
    if(typeof data === 'string'){
			tehai = JSON.parse(data);
    }
    else{
    	tehai = data;
    }

    
    //console.log(tehai.hai.length);
    //console.log(tehai.furo.length);

    //数据基本范围不正确时
    if(tehai.hai.length!==tehaiTypes||tehai.furo.length!==tehaiTypes||tehai.agari<0||tehai.agari>=tehaiTypes){
      return;
    }
    //和的牌并不在手牌中时
    if(tehai.hai[tehai.agari]===0){
      return;
    }

    //副露数量不正确时
    tehai.furoCount = 0;
    for(var i=0;i<tehaiTypes;i++){
      if(tehai.furo[i]!==0)
        tehai.furoCount++;
    }
    tehai.ankanCount = 0;
    for(var i=0;i<tehaiTypes;i++){
      if(tehai.furo[i]!==0&&tehai.furo[i]!==13)
        tehai.ankanCount++;
    }

    if(tehai.furoCount>4){
      return;
    }

    //手牌数量不正确时
    tehai.haiCount = 0;
    for(var i=0;i<tehai.hai.length;i++){
      if(tehai.hai[i]<=4&&tehai.hai[i]>=0){
        tehai.haiCount += tehai.hai[i];
      }
      else{
        tehai.haiCount = 0;
        break;
      }
    }

    if(tehai.haiCount!==14){
      return;
    }

    return tehai;
  };
  return function (data){
    var tehai = tehaiValidator(data);
    if(tehai!==undefined){
      //流满则不判断和牌
      if(!tehai.nakashi){
        tehai.agari = {
          count: 0,
          result: []
        };
        for(var i=0;i<tehaiTypes;i++){
          if(tehai.hai[i]>=2){
            tehai.hai[i]-=2;
            //国士判定
            if(i>=27||i%9===0||i%9===8){
              var kokushi = kokushiCheck(tehai);
              if(kokushi.count>0){
                tehai.agari.count+=kokushi.count;
                tehai.agari.result.push(kokushi.result[0]);//应该只返回一种,暂定
              }
            }
            //普通型判定
            var men = mentsuRemove(tehai);
            if(men.count>0){
              tehai.agari.count+=men.count;
              for(var k=0;k<men.result.length;k++){
                men.result[k].jyan = i;
                tehai.agari.result.push(men.result[k]);
              }
            }
            tehai.hai[i]+=2;
          }
        }
        //七对判定,因为取雀头导致重复放在外面
        //为全部识别出的牌型添加七对标记
        var chitoi = chitoiCheck(tehai)
        if(chitoi.count>0){
          tehai.agari.count++;
          tehai.agari.result.push(chitoi.result[0]);
          tehai.chitoi = true;
        }
      }
      return tehai;
    }
    else{
      return false;
    }
  };
}();

var agariPoint = function(){
  var fuCalc = function(tehai){
    for(var i=0;i<tehai.agari.result.length;i++){
      var fu = {
        base: 20,
        kotsu: 0,
        jyan: 0,
        machi: 0,
        menzen: 0,
        tsumo: 0,
        chitoi: 0,
        pinfu: 0
      };
      //七对固定25符
      if(tehai.agari.result[i].type==='chitoi'){
        fu.chitoi = 25;
      }
      //国士不算符
      else if(!tehai.kokushi){
        if(tehai.agariFrom===0){
          fu.tsumo+=2;
        }
        else if(tehai.furoCount-tehai.ankanCount===0){
          fu.menzen+=10;
        }
        for(var j=0;j<tehaiTypes;j++){
          if(tehai.agari.result[i].ko[j]!==0){
            switch(j){
              case 0:
              case 8:
              case 9:
              case 17:
              case 18:
              case 26:
              case 27:
              case 28:
              case 29:
              case 30:
              case 31:
              case 32:
              case 33:
                if(tehai.furo[j]!==0){
                  if(tehai.furo[j]<13){
                    fu.kotsu+=4;
                  }
                  if(tehai.furo[j]===13){
                    fu.kotsu+=32;
                  }
                  if(tehai.furo[j]>13){
                    fu.kotsu+=16;
                  }
                }
                else{
                  fu.kotsu+=8;
                }
                break;
              default:
                if(tehai.furo[j]!==0){
                  if(tehai.furo[j]<13){
                    fu.kotsu+=2;
                  }
                  if(tehai.furo[j]===13){
                    fu.kotsu+=16;
                  }
                  if(tehai.furo[j]>13){
                    fu.kotsu+=8;
                  }
                }
                else{
                  fu.kotsu+=4;
                }
                break;
            }
          }
        }
        switch(tehai.agari.result[i].jyan){
          case 0:
          case 8:
          case 9:
          case 17:
          case 18:
          case 26:
          case 31:
          case 32:
          case 33:
            fu.jyan+=2;
            break;
          default:
            break;
        }
        if(tehai.agari.result[i].jyan===tehai.ji){
          fu.jyan+=2;
        }
        if(tehai.agari.result[i].jyan===tehai.ba){
          fu.jyan+=2;
        }
        //嵌张看前一张牌存不存在顺子
        //边张37单独判断
        //单骑听雀头
        while(true){
          if(tehai.agariHai>0&&tehai.agariHai<27){
            if(tehai.agari.result[i].syon[tehai.agariHai-1]!==0){
              fu.machi+=2;
              break;
            }
          }
          if(tehai.agariHai%9===2&&tehai.agariHai<27){
            if(tehai.agari.result[i].syon[tehai.agariHai-2]!==0){
              fu.machi+=2;
              break;
            }
          }
          if(tehai.agariHai%9===6&&tehai.agariHai<27){
            if(tehai.agari.result[i].syon[tehai.agariHai+2]!==0){
              fu.machi+=2;
              break;
            }
          }
          if(tehai.agariHai===tehai.agari.result[i].jyan){
            if(tehai.agariHai>=27){
              fu.machi+=2;
              break;
            }
            else{
              switch(tehai.agariHai%9){
                case 0:
                case 1:
                case 2:
                  if(tehai.agari.result[i].syon[tehai.agariHai+1]===0){
                    fu.machi+=2;
                  }
                  break;
                case 3:
                case 4:
                case 5:
                  if(tehai.agari.result[i].syon[tehai.agariHai+1]===0
                    &&tehai.agari.result[i].syon[tehai.agariHai-3]===0){
                    fu.machi+=2;
                  }
                  break;
                case 6:
                case 7:
                case 8:
                  if(tehai.agari.result[i].syon[tehai.agariHai-3]===0){
                    fu.machi+=2;
                  }
                  break;
              }
            }
          }
          break;
        }
      }
      tehai.agari.result[i].fu = fu;
    }
  };
  var hanCalc = function(tehai){
    for(var i=0;i<tehai.agari.result.length;i++){
      //全番种
      var han = {
        dora: false,
        riichi: false,
        ippatsu: false,
        menzentsumo: false,
        tanyao: false,
        pinfu: false,
        ipeiko: false,
        //役牌的处理待定
        yaku_haku: false,
        yaku_hatsu: false,
        yaku_chun: false,
        yaku_jikaze: false,
        yaku_bakaze: false,
        rinsyan: false,
        chankan: false,
        haitei: false,
        hotei: false,
        sansyoku: false,
        ikki: false,
        honchantai: false,
        //七对在标准和牌判定前特殊处理,添加七对标记变量
        chitoi: false,
        toitoi: false,
        sananko: false,
        honro: false,
        santoko: false,
        sankan: false,
        syousangen: false,
        double: false,
        honitsu: false,
        junchantai: false,
        ryanpei: false,
        chinitsu: false,
        //国士在标准和牌判定前特殊处理,添加国士标记变量
        kokushi: false,
        suanko: false,
        daisangen: false,
        tsuiso: false,
        syousushi: false,
        daisushi: false,
        ryuiso: false,
        chinroto: false,
        sukantsu: false,
        churen: false,
        tenhou: false,
        chihou: false,
        nakashi: false
      };
      //国士,国士成立时不考虑其他牌型
      if(tehai.kokushi){
        han.kokushi = 13;
        tehai.agari.result[i].han = han;
        continue;
      }
      //七对,七对成立时计算七对复合,不再考虑其他牌型
      else if(tehai.agari.result[i].type==='chitoi'){
        han.chitoi = 2;
        //立直(双立直)
        if(tehai.riichi){
          if(tehai.double){
            han.double = 2;
          }
          else{
            han.riichi = 1;
          }
        }
        //一发
        if(tehai.ippatsu){
          han.ippatsu = 1;
        }
        //门清自摸
        if(tehai.furoCount===tehai.ankanCount&&tehai.agariFrom===0){
          han.menzentsumo = 1;
        }
        //断幺
        if(tehai.agari.result[i].toi[0]
          +tehai.agari.result[i].toi[8]
          +tehai.agari.result[i].toi[9]
          +tehai.agari.result[i].toi[17]
          +tehai.agari.result[i].toi[18]
          +tehai.agari.result[i].toi[26]
          +tehai.agari.result[i].toi[27]
          +tehai.agari.result[i].toi[28]
          +tehai.agari.result[i].toi[29]
          +tehai.agari.result[i].toi[30]
          +tehai.agari.result[i].toi[31]
          +tehai.agari.result[i].toi[32]
          +tehai.agari.result[i].toi[33]===0){
          han.tanyao = 1;
        }
        //海底/河底
        if(tehai.last){
          if(tehai.agariFrom===0){
            han.haitei = 1;
          }
          else{
            han.hotei = 1;
          }
        }
        //天和/地和
        if(tehai.first){
          if(tehai.agariFrom===0){
            if(tehai.ji===27){
              han.tenhou = 13;
            }
            else{
              han.chihou = 13;
            }
          }
        }
        //混老头
        while(true){
          honro = true;
          for(var j=0;j<27;j++){
            if(j%9===0||j%9===8){
              continue;
            }
            if(tehai.agari.result[i].toi[i]!==0){
              honro = false;
            }
          }
          if(honro){
            han.honro = 2;
          }
          break;
        }
        //混清字
        while(true){
          var pattern = [0,0,0,0];
          var type = 0;
          //magic number idicating the pattern types
          for(var j=0;j<3;j++){
            //magic number indicating the number of mentsu avaliable in a pattern
            for(var k=0;k<9;k++){
              if(tehai.agari.result[i].toi[j*9+k]){
                pattern[j]++;
                break;
              }
            }
          }
          for(var j=27;j<tehaiTypes;j++){
            if(tehai.agari.result[i].toi[j]){
              pattern[3]++;
              break;
            }
          }
          if(pattern[0]+pattern[1]+pattern[2]===1){
            if(pattern[3]===1){
              han.honitsu = 3;
            }
            else{
              han.chinitsu = 6;
            }
          }
          if(pattern[0]+pattern[1]+pattern[2]===0){
            han.tsuiso = 13;
          }
          break;
        }
        tehai.agari.result[i].han = han;
        continue;
      }
      //其他标准型
      else if(true){
        //立直(双立直)
        if(tehai.riichi){
          if(tehai.double){
            han.double = 2;
          }
          else{
            han.riichi = 1;
          }
        }
        //一发
        if(tehai.ippatsu){
          han.ippatsu = 1;
        }
        //门清自摸
        if(tehai.furoCount===tehai.ankanCount&&tehai.agariFrom===0){
          han.menzentsumo = 1;
        }
        //断幺
        if(tehai.agari.result[i].syon[0]
          +tehai.agari.result[i].syon[6]
          +tehai.agari.result[i].syon[9]
          +tehai.agari.result[i].syon[15]
          +tehai.agari.result[i].syon[18]
          +tehai.agari.result[i].syon[24]
          +tehai.agari.result[i].ko[0]
          +tehai.agari.result[i].ko[8]
          +tehai.agari.result[i].ko[9]
          +tehai.agari.result[i].ko[17]
          +tehai.agari.result[i].ko[18]
          +tehai.agari.result[i].ko[26]
          +tehai.agari.result[i].ko[27]
          +tehai.agari.result[i].ko[28]
          +tehai.agari.result[i].ko[29]
          +tehai.agari.result[i].ko[30]
          +tehai.agari.result[i].ko[31]
          +tehai.agari.result[i].ko[32]
          +tehai.agari.result[i].ko[33]===0
          &&tehai.agari.result[i].jyan<27
          &&tehai.agari.result[i].jyan%9!==0
          &&tehai.agari.result[i].jyan%9!==8){
          han.tanyao = 1;
        }
        //役牌
        if(true){
          if(tehai.agari.result[i].ko[31]){
            han.yaku_haku = 1;
          }
          if(tehai.agari.result[i].ko[32]){
            han.yaku_hatsu = 1;
          }
          if(tehai.agari.result[i].ko[33]){
            han.yaku_chun = 1;
          }
          if(tehai.agari.result[i].ko[tehai.ji]){
            han.yaku_jikaze = 1;
          }
          if(tehai.agari.result[i].ko[tehai.ba]){
            han.yaku_bakaze = 1;
          }
        }
        //平和
        if(tehai.agari.result[i].fu.kotsu
          +tehai.agari.result[i].fu.jyan
          +tehai.agari.result[i].fu.machi
          +tehai.furoCount-tehai.ankanCount===0){
          han.pinfu = 1;
          if(tehai.agariFrom===0){
            tehai.agari.result[i].fu.pinfu = 20;
          }
          else{
            tehai.agari.result[i].fu.pinfu = 30;
          }
        }
        //一盃口/二盃口
        if(tehai.furoCount===tehai.ankanCount){
          for(var j=0;j<tehaiTypes;j++){
            if(tehai.agari.result[i].syon[j]===2){//大于2的话计为三暗刻,此处不计算
              han.ipeiko = 1;
              for(j++;j<tehaiTypes;j++){
                if(tehai.agari.result[i].syon[j]===2){//大于2的话计为三暗刻,此处不计算
                  han.ryanpei = 3;
                }
              }
            }
          }
        }
        //岭上
        if(tehai.rinsyan){
          han.rinsyan = 1;
        }
        //抢杠
        if(tehai.chankan){
          han.chankan = 1;
        }
        //海底/河底
        if(tehai.last){
          if(tehai.agariFrom===0){
            han.haitei = 1;
          }
          else{
            han.hotei = 1;
          }
        }
        //三色同顺/三色同刻
        //magic number indicating the number of mentsu avaliable in a pattern
        for(var j=0;j<9;j++){
          if(j%9<7){
            if(tehai.agari.result[i].syon[j]>0){
              if(tehai.agari.result[i].syon[j+9]>0){
                if(tehai.agari.result[i].syon[j+18]>0){
                  if(tehai.furoCount===tehai.ankanCount){
                    han.sansyoku = 2;
                  }
                  else{
                    han.sansyoku = 1;
                  }
                }
              }
            }
          }
          if(tehai.agari.result[i].ko[j]>0){
            if(tehai.agari.result[i].ko[j+9]>0){
              if(tehai.agari.result[i].ko[j+18]>0){
                han.santoko = 2;
              }
            }
          }
        }
        //一气通贯
        //magic number idicating the pattern types
        for(var j=0;j<3;j++){
          if(tehai.agari.result[i].syon[j*9]>0){
            if(tehai.agari.result[i].syon[j*9+3]>0){
              if(tehai.agari.result[i].syon[j*9+6]>0){
                if(tehai.furoCount===tehai.ankanCount){
                  han.ikki = 2;
                  break;
                }
                else{
                  han.ikki = 1;
                  break;
                }
              }
            }
          }
        }
        //全带与老头
        while(true){
          var honchantai = true;
          var junchantai = true;
          var honro = true;
          var chinroto = true;
          for(var j=0;j<tehaiTypes;j++){
            if(j>=27){
              if(tehai.agari.result[i].ko[j]!==0){
                junchantai = false;
                chinroto = false;
                break;
              }
            }
            else{
              if(j%9===0){
                if(tehai.agari.result[i].syon[j]!==0){
                  honro = false;
                  chinroto = false;
                }
                continue;
              }
              if(j%9<7){
                if(j%9!==6){
                  if(tehai.agari.result[i].syon[j]!==0){
                    honchantai = false;
                    junchantai = false;
                    honro = false;
                    chinroto = false;
                    break;
                  }
                }
                else{
                  if(tehai.agari.result[i].syon[j]!==0){
                    honro = false;
                    chinroto = false;
                  }
                }
              }
              if(j%9!==8){
                if(tehai.agari.result[i].ko[j]!==0){
                  honchantai = false;
                  junchantai = false;
                  honro = false;
                  chinroto = false;
                  break;
                }
              }
            }
          }
          if(tehai.agari.result[i].jyan>=27){
            if(honchantai){
              if(tehai.furoCount===tehai.ankanCount){
                han.honchantai = 2;
              }
              else{
                han.honchantai = 1;
              }
            }
            if(honro){
              han.honro = 2;
            }
          }
          else{
            if(tehai.agari.result[i].jyan%9===0
              &&tehai.agari.result[i].jyan%9===8){
              if(honchantai){
                if(tehai.furoCount===tehai.ankanCount){
                  han.honchantai = 2;
                }
                else{
                  han.honchantai = 1;
                }
              }
              if(junchantai){
                if(tehai.furoCount===tehai.ankanCount){
                  han.junchantai = 3;
                }
                else{
                  han.junchantai = 2;
                }
              }
              if(honro){
                han.honro = 2;
              }
              if(chinroto){
                han.chinroto = 13;
              }
            }
          }
          break;
        }
        //对对和
        while(true){
          var toitoi = true;
          for(var j=0;j<tehaiTypes;j++){
            if(j>=27){
              continue;
            }
            if(j%9>=7){
              continue;
            }
            if(tehai.agari.result[i].syon[j]!==0){
              toitoi = false;
              break;
            }
          }
          if(toitoi){
            han.toitoi = 2;
          }
          break;
        }
        //三暗刻/三杠子/四暗刻/四杠子
        while(true){
          var anko = 0;
          var kan = 0;
          for(var j=0;j<tehaiTypes;j++){
            if(tehai.agari.result[i].ko[j]!==0){
              if(tehai.furo[j]===0){
                if(j!==tehai.agariHai){
                  anko++;
                }
              }
              if(tehai.furo[j]===13){
                anko++;
                kan++;
              }
              if(tehai.furo[j]>13){
                kan++;
              }
            }
          }
          if(anko===3){
            han.sananko = 2;
          }
          if(anko===4){
            han.suanko = 13;
          }
          if(kan===3){
            han.sankan = 2;
          }
          if(kan===4){
            han.sukantsu = 13;
          }
          break;
        }
        //混一色/清一色/字一色/九莲宝灯
        while(true){
          var pattern = [0,0,0,0];
          var type = 0;
          //magic number idicating the pattern types
          for(var j=0;j<3;j++){
            //magic number indicating the number of mentsu avaliable in a pattern
            for(var k=0;k<9;k++){
              if(k%9<7){
                if(tehai.agari.result[i].syon[j*9+k]){
                  pattern[j]++;
                  break;
                }
              }
              if(tehai.agari.result[i].ko[j*9+k]){
                pattern[j]++;
                break;
              }
            }
          }
          for(var j=27;j<tehaiTypes;j++){
            if(tehai.agari.result[i].ko[j]){
              pattern[3]++;
              break;
            }
          }
          pattern[Math.floor(tehai.agari.result[i].jyan/9)] = 1;
          if(pattern[0]+pattern[1]+pattern[2]===1){
            if(pattern[3]===1){
              if(tehai.furoCount===tehai.ankanCount){
                han.honitsu = 3;
              }
              else{
                han.honitsu = 2;
              }
            }
            else{
              if(tehai.furoCount===tehai.ankanCount){
                han.chinitsu = 6;
                //九莲宝灯
                if(true){
                  if(pattern[0]!==0){
                    type = 0;
                  }
                  if(pattern[1]!==0){
                    type = 1;
                  }
                  if(pattern[2]!==0){
                    type = 2;
                  }
                  if(true){
                    //111 123 456 789 99
                    if(tehai.agari.result[i].ko[type*9+0]
                      &&tehai.agari.result[i].syon[type*9+0]
                      &&tehai.agari.result[i].syon[type*9+3]
                      &&tehai.agari.result[i].syon[type*9+6]
                      &&tehai.agari.result[i].jyan===type*9+8){
                      han.churen = 13;
                    }
                    //111 234 456 789 99
                    if(tehai.agari.result[i].ko[type*9+0]
                      &&tehai.agari.result[i].syon[type*9+1]
                      &&tehai.agari.result[i].syon[type*9+3]
                      &&tehai.agari.result[i].syon[type*9+6]
                      &&tehai.agari.result[i].jyan===type*9+8){
                      han.churen = 13;
                    }
                    //111 234 567 789 99
                    if(tehai.agari.result[i].ko[type*9+0]
                      &&tehai.agari.result[i].syon[type*9+1]
                      &&tehai.agari.result[i].syon[type*9+4]
                      &&tehai.agari.result[i].syon[type*9+6]
                      &&tehai.agari.result[i].jyan===type*9+8){
                      han.churen = 13;
                    }
                    //111 22 345 678 999
                    if(tehai.agari.result[i].ko[type*9+0]
                      &&tehai.agari.result[i].ko[type*9+8]
                      &&tehai.agari.result[i].syon[type*9+2]
                      &&tehai.agari.result[i].syon[type*9+5]
                      &&tehai.agari.result[i].jyan===type*9+1){
                      han.churen = 13;
                    }
                    //111 234 55 678 999
                    if(tehai.agari.result[i].ko[type*9+0]
                      &&tehai.agari.result[i].ko[type*9+8]
                      &&tehai.agari.result[i].syon[type*9+1]
                      &&tehai.agari.result[i].syon[type*9+5]
                      &&tehai.agari.result[i].jyan===type*9+4){
                      han.churen = 13;
                    }
                    //111 234 567 88 999
                    if(tehai.agari.result[i].ko[type*9+0]
                      &&tehai.agari.result[i].ko[type*9+8]
                      &&tehai.agari.result[i].syon[type*9+1]
                      &&tehai.agari.result[i].syon[type*9+4]
                      &&tehai.agari.result[i].jyan===type*9+7){
                      han.churen = 13;
                    }
                    //11 123 345 678 999
                    if(tehai.agari.result[i].ko[type*9+8]
                      &&tehai.agari.result[i].syon[type*9+0]
                      &&tehai.agari.result[i].syon[type*9+2]
                      &&tehai.agari.result[i].syon[type*9+5]
                      &&tehai.agari.result[i].jyan===type*9+0){
                      han.churen = 13;
                    }
                    //11 123 456 678 999
                    if(tehai.agari.result[i].ko[type*9+8]
                      &&tehai.agari.result[i].syon[type*9+0]
                      &&tehai.agari.result[i].syon[type*9+3]
                      &&tehai.agari.result[i].syon[type*9+5]
                      &&tehai.agari.result[i].jyan===type*9+0){
                      han.churen = 13;
                    }
                    //11 123 456 789 999
                    if(tehai.agari.result[i].ko[type*9+8]
                      &&tehai.agari.result[i].syon[type*9+0]
                      &&tehai.agari.result[i].syon[type*9+3]
                      &&tehai.agari.result[i].syon[type*9+6]
                      &&tehai.agari.result[i].jyan===type*9+0){
                      han.churen = 13;
                    }
                  }
                }

              }
              else{
                han.chinitsu = 5;
              }
            }
          }
          if(pattern[0]+pattern[1]+pattern[2]===0){
            han.tsuiso = 13;
          }
          break;
        }
        //小三元/大三元/小四喜/大四喜
        while(true){
          var sangen = 0;
          var sushi = 0;
          if(tehai.agari.result[i].ko[27]){
            sushi+=2;
          }
          if(tehai.agari.result[i].ko[28]){
            sushi+=2;
          }
          if(tehai.agari.result[i].ko[29]){
            sushi+=2;
          }
          if(tehai.agari.result[i].ko[30]){
            sushi+=2;
          }
          if(tehai.agari.result[i].jyan>=27&&tehai.agari.result[i].jyan<=30){
            sushi+=1;
          }
          if(tehai.agari.result[i].ko[31]){
            sangen+=2;
          }
          if(tehai.agari.result[i].ko[32]){
            sangen+=2;
          }
          if(tehai.agari.result[i].ko[33]){
            sangen+=2;
          }
          if(tehai.agari.result[i].jyan>=31&&tehai.agari.result[i].jyan<=33){
            sangen+=1;
          }
          if(sangen===5){
            han.syousangen = 2;
          }
          if(sangen===6){
            han.daisangen = 13;
          }
          if(sushi===7){
            han.syousushi = 2;
          }
          if(sushi===8){
            han.daisushi = 13;
          }
          break;
        }
        //绿一色
        if(tehai.agari.result[i].syon[10]
          +tehai.agari.result[i].ko[10]
          +tehai.agari.result[i].ko[11]
          +tehai.agari.result[i].ko[12]
          +tehai.agari.result[i].ko[14]
          +tehai.agari.result[i].ko[16]
          +tehai.agari.result[i].ko[32]===4
          &&(tehai.agari.result[i].jyan===10
            ||tehai.agari.result[i].jyan===11
            ||tehai.agari.result[i].jyan===12
            ||tehai.agari.result[i].jyan===14
            ||tehai.agari.result[i].jyan===16
            ||tehai.agari.result[i].jyan===32)){
          han.ryuiso = 13;
        }
        //天和/地和
        if(tehai.first){
          if(tehai.agariFrom===0){
            if(tehai.ji===27){
              han.tenhou = 13;
            }
            else{
              han.chihou = 13;
            }
          }
        }
      }
      tehai.agari.result[i].han = han;
    }
  };
  var hanMerge = function(tehai){
    for(var i=0;i<tehai.agari.result.length;i++){
      //由于手牌型在计算和牌时已经区分,在此去掉重复番后直接求和
      //一些在计算是不会重复出现的也做了去重逻辑
      //顺子型,刻子型,七对型,国士型已经互斥

      //役满部分,当触发役满时消除非役满番种
      if(true){
        if(tehai.agari.result[i].han.kokushi
          ||tehai.agari.result[i].han.suanko
          ||tehai.agari.result[i].han.daisangen
          ||tehai.agari.result[i].han.tsuiso
          ||tehai.agari.result[i].han.syousushi
          ||tehai.agari.result[i].han.daisushi
          ||tehai.agari.result[i].han.ryuiso
          ||tehai.agari.result[i].han.chinroto
          ||tehai.agari.result[i].han.sukantsu
          ||tehai.agari.result[i].han.churen
          ||tehai.agari.result[i].han.tenhou
          ||tehai.agari.result[i].han.chihou){
          tehai.agari.result[i].han.dora = false;
          tehai.agari.result[i].han.riichi = false;
          tehai.agari.result[i].han.ippatsu = false;
          tehai.agari.result[i].han.menzentsumo = false;
          tehai.agari.result[i].han.tanyao = false;
          tehai.agari.result[i].han.pinfu = false;
          tehai.agari.result[i].han.ipeiko = false;
          tehai.agari.result[i].han.yaku_haku = false;
          tehai.agari.result[i].han.yaku_hatsu = false;
          tehai.agari.result[i].han.yaku_chun = false;
          tehai.agari.result[i].han.yaku_jikaze = false;
          tehai.agari.result[i].han.yaku_bakaze = false;
          tehai.agari.result[i].han.rinsyan = false;
          tehai.agari.result[i].han.chankan = false;
          tehai.agari.result[i].han.haitei = false;
          tehai.agari.result[i].han.hotei = false;
          tehai.agari.result[i].han.sansyoku = false;
          tehai.agari.result[i].han.ikki = false;
          tehai.agari.result[i].han.honchantai = false;
          tehai.agari.result[i].han.chitoi = false;
          tehai.agari.result[i].han.toitoi = false;
          tehai.agari.result[i].han.sananko = false;
          tehai.agari.result[i].han.honro = false;
          tehai.agari.result[i].han.santoko = false;
          tehai.agari.result[i].han.sankan = false;
          tehai.agari.result[i].han.syousangen = false;
          tehai.agari.result[i].han.double = false;
          tehai.agari.result[i].han.honitsu = false;
          tehai.agari.result[i].han.junchantai = false;
          tehai.agari.result[i].han.ryanpei = false;
          tehai.agari.result[i].han.chinitsu = false;
        }
      }
      //清一色取消混一色
      if(tehai.agari.result[i].han.chinitsu){
        tehai.agari.result[i].han.honitsu = false;
      }
      //纯全带取消混全带
      if(tehai.agari.result[i].han.junchantai){
        tehai.agari.result[i].han.honchantai = false;
      }
      //混老头取消混全带
      if(tehai.agari.result[i].han.honro){
        tehai.agari.result[i].han.honchantai = false;
      }
      //两盃口取消一盃口
      if(tehai.agari.result[i].han.ryanpei){
        tehai.agari.result[i].han.ipeiko = false;
      }
      //双立直取消立直
      if(tehai.agari.result[i].han.ryanpei){
        tehai.agari.result[i].han.ipeiko = false;
      }
      //求和
      var hanCount = 0;
      for(var j in tehai.agari.result[i].han){
        if(tehai.agari.result[i].han[j]){
          hanCount+=tehai.agari.result[i].han[j];
        }
      }
      //番数仅计算到13
      tehai.agari.result[i].han.count = hanCount > 13 ? 13 :hanCount;
    }
  };
  var fuMerge = function(tehai){
    for(var i=0;i<tehai.agari.result.length;i++){
      //跟算番一样,不用去重
      //求和
      if(tehai.agari.result[i].fu.chitoi){
        tehai.agari.result[i].fu.count = tehai.agari.result[i].fu.chitoi;
      }
      else if(tehai.agari.result[i].fu.pinfu){
        tehai.agari.result[i].fu.count = tehai.agari.result[i].fu.pinfu;
      }
      else{
        tehai.agari.result[i].fu.count = tehai.agari.result[i].fu.base;
        tehai.agari.result[i].fu.count+= tehai.agari.result[i].fu.kotsu;
        tehai.agari.result[i].fu.count+= tehai.agari.result[i].fu.jyan;
        tehai.agari.result[i].fu.count+= tehai.agari.result[i].fu.machi;
        tehai.agari.result[i].fu.count+= tehai.agari.result[i].fu.menzen;
        tehai.agari.result[i].fu.count+= tehai.agari.result[i].fu.tsumo;
        tehai.agari.result[i].fu.count = Math.ceil(tehai.agari.result[i].fu.count/10)*10;
      }
    }
  };
  var basePoint = function(tehai){
    for(var i=0;i<tehai.agari.result.length;i++){
      var basePoint = tehai.agari.result[i].fu.count*Math.pow(2,tehai.agari.result[i].han.count+2);
      if(basePoint>=2000){
        if(tehai.agari.result[i].han.count)
        switch(tehai.agari.result[i].han.count){
          case 3:
          case 4:
          case 5:
            basePoint = 2000;
            break;
          case 6:
          case 7:
            basePoint = 3000;
            break;
          case 8:
          case 9:
          case 10:
            basePoint = 4000;
            break;
          case 11:
          case 12:
            basePoint = 6000;
            break;
          case 13:
            basePoint = 8000;
            break;
        }
      }
      else{
        tehai.agari.result[i].basePoint = basePoint;
      }
    }
  };
  var pointCalc = function(basePoint,multiplier){
    return Math.ceil((basePoint*multiplier)/100)*100;
  };
  return function(tehai){
    //流满
    if(tehai.nakashi){
      tehai.basePoint = 2000;
    }
    else{
      fuCalc(tehai);
      hanCalc(tehai);
      fuMerge(tehai);
      hanMerge(tehai);
      basePoint(tehai);
      //tehai.basePoint = tehai.fu*Math.pow(2,tehai.han+2);
    }
    return tehai;
  };
}();

var ioResponse = function(io){
	io.on('connection', function(socket){
		console.log('a user connected');

		socket.on('disconnect', function(){
			console.log('user disconnected');
		});
	});
}


module.exports = {router: router, socket: ioResponse};