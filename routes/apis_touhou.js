var express = require('express');
var router = express.Router();

//副露的表示由散列单值替换为散列数组值
//副露标记
//0:吃1位
//1:吃2位
//2:吃3位
//3:碰下家
//4:碰对家
//5:碰上家
//6:杠下家
//7:杠对家
//8:杠上家
//9:暗杠
//10:加杠下家
//11:加杠对家
//12:加杠上家

function clone(obj) {
  var copy;
  // Handle the 3 simple types, and null or undefined
  if (null === obj || "object" !== typeof obj) return obj;
  // Handle Date
  else if (obj instanceof Date) {
      copy = new Date();
      copy.setTime(obj.getTime());
      return copy;
  }
  // Handle Array
  else if (obj instanceof Array) {
      copy = [];
      for (var i = 0, len = obj.length; i < len; i++) {
          copy[i] = clone(obj[i]);
      }
      return copy;
  }
  // Handle Object
  else if (obj instanceof Object) {
    if (obj.constructor !== Object()){
      copy = new obj.constructor(obj);
      return copy;
    }
    else{
      copy = {};
      for (var attr in obj) {
          if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
      }
      return copy;
    }
  }
  else {
    throw new Error("Unable to copy obj! Its type isn't supported.");
  }
}

function Yama(){
  this.data = [];
}
Yama.prototype.init = function(){
  for(var j=0;j<136;j++){
    this.data[j] = j;
  }
  var rand;
  var tmp;
  for(var j=0;j<136*5;j++){
    rand = Math.random()*136;
    tmp = this.data[Math.floor(rand)];
    this.data[Math.floor(rand)] = this.data[j%136];
    this.data[j%136] = tmp;
  }
};
Yama.prototype.drawHead = function(){
  return this.data.shift();
};
//TODO:岭上摸完/在其他地方处理四杠流局
Yama.prototype.drawTail = function(){
  return this.data.pop();
};
Yama.prototype.getLength = function(){
  return this.data.length;
};

// furo:{
//   tile: Number,
//   value: Number
// }

function Furo(source){
  if(source){
    this.data = source.data.slice();
  }
  else{
    this.data = [];
  }
}
Furo.prototype.isValid = function(){
//   if(this.data.length!==34){
//     return false;
//   }
//   else{
//     for(var i=0;i<this.data.length;i++){
//       for(var j=0;j<this.data[i].length;j++){
//         if(this.data[i][j]<1||this.data[i][j]>16){
//           return false;
//         }
//       }
//     }
//   }
  return true;
};
Furo.prototype.count = function(){
  return this.data.length;
};
Furo.prototype.noFuro = function(tile){
  for(var i=0;i<this.data.length;i++){
    if(this.data[i].tile===tile&&this.data[i].value!==9){
      return false;
    }
  }
  return true;
};
Furo.prototype.riichi = function(){
  for(var i=0;i<this.data.length;i++){
    if(this.data[i].value!==9){
      return false;
    }
  }
  return true;
};
Furo.prototype.exist = function(tile,value){
  for(var i=0;i<this.data.length;i++){
    if(this.data[i].tile===tile&&this.data[i].value===value){
      return true;
    }
  }
  return false;
};
Furo.prototype.set = function(tile,value){
  this.data.push({
    tile: tile,
    value: value
  });
};
//碰→杠
Furo.prototype.upgrade = function(tile){
  for(var i=0;i<this.data.length;i++){
    if(this.data[i].tile===tile&&(this.data[i].value===3||this.data[i].value===4||this.data[i].value===5)){
      this.data[i].value+=6;
    }
  }
};
Furo.prototype.getMap = function(){
  var furoMap = [[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]];
  for(var i=0;i<this.data.length;i++){
    furoMap[this.data[i].tile].push(this.data[i].value);
  }
  return furoMap;
};

function Tehai(source){
  if(source){
    this.point = source.point;
    this.haiIndex = source.haiIndex.slice();
    this.hai = source.hai.slice();
    this.validHai = source.validHai.slice();
    this.furo = new Furo(source.furo);
    this.dora = source.dora.slice();
    this.discard = source.discard.slice();
    this.agariHai = source.agariHai;
    this.agariFrom = source.agariFrom;
    this.round = source.round;
    this.ji = source.ji;
    this.ba = source.ba;
    this.chitoi = source.chitoi;
    this.kokushi = source.kokushi;
    this.first = source.first;
    this.last = source.last;
    this.riichi = source.riichi;
    this.riichiReady = source.riichiReady;
    this.ippatsu = source.ippatsu;
    this.rinsyan = source.rinsyan;
    this.double = source.double;
    this.chankan = source.chankan;
    this.nakashi = source.nakashi;
  }
  else{
    this.point = 25000;
    this.haiIndex = [];
    this.hai = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
    this.validHai = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
    this.furo = new Furo();
    this.dora = [0,0,0,0,0];
    this.discard = [];
    this.agariHai = null;
    this.agariFrom = null;
    this.round = 0;
    this.ji = null;
    this.ba = null;
    this.chitoi = false;
    this.kokushi = false;
    this.first = false;
    this.last = false;
    this.riichi = false;
    this.riichiReady = false;
    this.ippatsu = false;
    this.rinsyan = false;
    this.double = false;
    this.chankan = false;
    this.nakashi = false;
  }
}

//operation
//标记计算出来的副露
//对每一种可能，将结果push到data数组中
//在处理时根据数组置状态
//client根据这个数组显示可能的操作
//
//
//   tile: Number,
//   data: Array[Number]
//value的值参考顶部副露表
function Operation(){
  this.tile = null;
  this.data = [];
  // this.chi = false;
  // this.pon = false;
  // this.kan = false;
  // this.agari = false;
  // this.riichi = false;
}
//跟Operation其实没有什么关系
//在player弃牌时对可能共同触发的副露和和牌进行处理
//填入的内容
//player: Number
//operation: String
//data: Object{
//  index: Number,
//  value: Number
//}
//or 和牌结果
function OperationQueue(){
  this.queue = [[],[],[]];
}
OperationQueue.prototype.reset = function(){
  this.queue = [[],[],[]];
};
OperationQueue.prototype.push = function(param){
  if(param.operation==='chi'){
    this.queue[2].push(param);
  }
  if(param.operation==='pon'||param.operation==='kan'){
    this.queue[1].push(param);
  }
  if(param.operation==='agari'){
    this.queue[0].push(param);
  }
};
OperationQueue.prototype.result = function(){
  if(this.queue[0].length){
    return this.queue[0];
  }
  else if(this.queue[1].length){
    return this.queue[1];
  }
  else if(this.queue[2].length){
    return this.queue[2];
  }
  else{
    return [];
  }
};


var tehaiTypes = 34;


var syanten = function(){
  var mentsuRemove = function(tehai,level){
    var syanten = [];
    //取顺
    for(var i=0;i<34;i++){
      if(i%9<7&&i<27){
        if(tehai.hai[i]>0&&tehai.hai[i+1]>0&&tehai.hai[i+2]>0){
          if(level!==4){
            tehai.hai[i]--;
            tehai.hai[i+1]--;
            tehai.hai[i+2]--;
            var ret = mentsuRemove(tehai,level+1);
            //mod ret with this
            if(ret.length===0){
              ret.push({'mentsu': 0,'tatsu': 0});
            }
            for(var j=0;j<ret.length;j++){
              ret[j].mentsu++;
            }
            syanten = syanten.concat(ret);
            tehai.hai[i]++;
            tehai.hai[i+1]++;
            tehai.hai[i+2]++;
            break;
          }
          else{
            var res = {'mentsu': 0,'tatsu': 0};
            res.mentsu++;
            syanten.push(res);
            break;
          }
        }
      }
    }
    //取刻
    for(var i=0;i<34;i++){
      if(tehai.hai[i]>=3){
        if(level!==4){
          tehai.hai[i]--;
          tehai.hai[i]--;
          tehai.hai[i]--;
          var ret = mentsuRemove(tehai,level+1);
          //mod ret with this
          if(ret.length===0){
            ret.push({'mentsu': 0,'tatsu': 0});
          }
          for(var j=0;j<ret.length;j++){
            ret[j].mentsu++;
          }
          syanten = syanten.concat(ret);
          tehai.hai[i]++;
          tehai.hai[i]++;
          tehai.hai[i]++;
          break;
        }
        else{
          var res = {'mentsu': 0,'tatsu': 0};
          res.mentsu++;
          syanten.push(res);
          break;
        }
      }
    }
    //取AA
    for(var i=0;i<34;i++){
      if(tehai.hai[i]>=2){
        if(level!==4){
          tehai.hai[i]--;
          tehai.hai[i]--;
          var ret = mentsuRemove(tehai,level+1);
          //mod ret with this
          if(ret.length===0){
            ret.push({'mentsu': 0,'tatsu': 0});
          }
          for(var j=0;j<ret.length;j++){
            ret[j].tatsu++;
          }
          syanten = syanten.concat(ret);
          tehai.hai[i]++;
          tehai.hai[i]++;
          break;
        }
        else{
          var res = {'mentsu': 0,'tatsu': 0};
          res.tatsu++;
          syanten.push(res);
          break;
        }
      }
    }
    //取AB
    for(var i=0;i<34;i++){
      if(i%9<8&&i<27){
        if(tehai.hai[i]>0&&tehai.hai[i+1]>0){
          if(level!==4){
            tehai.hai[i]--;
            tehai.hai[i+1]--;
            var ret = mentsuRemove(tehai,level+1);
            //mod ret with this
            if(ret.length===0){
              ret.push({'mentsu': 0,'tatsu': 0});
            }
            for(var j=0;j<ret.length;j++){
              ret[j].tatsu++;
            }
            syanten = syanten.concat(ret);
            tehai.hai[i]++;
            tehai.hai[i+1]++;
            break;
          }
          else{
            var res = {'mentsu': 0,'tatsu': 0};
            res.tatsu++;
            syanten.push(res);
            break;
          }
        }
      }
    }
    //取AC
    for(var i=0;i<34;i++){
      if(i%9<7&&i<27){
        if(tehai.hai[i]>0&&tehai.hai[i+2]>0){
          if(level!==4){
            tehai.hai[i]--;
            tehai.hai[i+2]--;
            var ret = mentsuRemove(tehai,level+1);
            //mod ret with this
            if(ret.length===0){
              ret.push({'mentsu': 0,'tatsu': 0});
            }
            for(var j=0;j<ret.length;j++){
              ret[j].tatsu++;
            }
            syanten = syanten.concat(ret);
            tehai.hai[i]++;
            tehai.hai[i+2]++;
            break;
          }
          else{
            var res = {'mentsu': 0,'tatsu': 0};
            res.tatsu++;
            syanten.push(res);
            break;
          }
        }
      }
    }
    return syanten;
  };
  return function(tehai){
    var syanten = {};
    var kokushi = 13;
    var kokushiPair = 0;
    for(var i=0;i<34;i++){
      if(i%9===0||i%9===8||i>=27){
        if(tehai.hai[i]>0){
          kokushi--;
        }
        if(tehai.hai[i]>1){
          kokushiPair = 1;
        }
      }
    }
    kokushi -= kokushiPair;
    syanten.kokushi = kokushi;

    var chitoi = 6;
    for(var i=0;i<34;i++){
      if(tehai.hai[i]>1){
        chitoi--;
      }
    }
    syanten.chitoi = chitoi;

    var normal = [];
    for(var i=0;i<34;i++){
      if(tehai.hai[i]>=2){
        tehai.hai[i]-=2;
        var tmp = mentsuRemove(tehai,1);
        if(tmp.length===0){
          tmp.push({'mentsu': 0,'tatsu': 0});
        }
        for(var j=0;j<tmp.length;j++){
          tmp[j].jyan = 1;
        }
        normal = normal.concat(tmp);
        tehai.hai[i]+=2;
      }
    }
    var tmp = mentsuRemove(tehai,1);
    normal = normal.concat(tmp);
    normal = normal.map(function(value){
      if(value.jyan){
        return 7-value.mentsu*2-(value.tatsu<=4-value.mentsu?value.tatsu:4-value.mentsu);
      }
      else{
        return 8-value.mentsu*2-(value.tatsu<=4-value.mentsu?value.tatsu:4-value.mentsu);
      }
    });
    normal.sort(function(a,b){
       return a-b;
    });

    syanten.normal = normal[0];

    syanten.result = syanten.kokushi;
    if(syanten.chitoi < syanten.result){
      syanten.result = syanten.chitoi;
    }
    if(syanten.normal < syanten.result){
      syanten.result = syanten.normal;
    }
    return syanten;
  }
}();

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
                var next = mentsuRemove(tehai,level+1);
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
          var next = mentsuRemove(tehai,level+1,true);
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
          };
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
  var tehaiValidator = function(tehai){

    //todo:
    //1:副露的范围
    //2:和牌是杠牌
    //3:根据各家牌判断和牌存不存在


    //数据基本范围不正确时
    if(tehai.hai.length!==tehaiTypes||!tehai.furo.isValid()||tehai.agari<0||tehai.agari>=tehaiTypes){
      return false;
    }
    //和的牌并不在手牌中时
    if(tehai.hai[tehai.agari]===0){
      return false;
    }

    //副露数量不正确时
    tehai.furoCount = tehai.furo.count();
    tehai.ankanCount = 0;
    for(var i=0;i<tehaiTypes;i++){
      if(tehai.furo.exist(i,9)){
        tehai.ankanCount++;
      }
    }

    if(tehai.furoCount>4){
       return false;
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
      return false;
    }

    return true;
  };
  return function (tehai){
    tehai.agari = {
      count: 0,
      result: []
    };
    if(tehaiValidator(tehai)){
      //流满则不判断和牌
      if(!tehai.nakashi){
        //振听判定
        //TODO: 完善
        //打出过和牌且和牌不是自摸
        if(tehai.discard.indexOf(tehai.agariHai)!==-1&&tehai.agariFrom!==0){
          return false;
        }
        else{
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
          //添加新的七对牌型，七对牌型在算番时只计算与七对复合的番种
          var chitoi = chitoiCheck(tehai);
          if(chitoi.count>0){
            tehai.agari.count++;
            tehai.agari.result.push(chitoi.result[0]);
            tehai.chitoi = true;
          }
        }
        return tehai;
      }
      //TODO: 流局满贯标记
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
                //碰
                if(tehai.furo.exist(j,3)||tehai.furo.exist(j,4)||tehai.furo.exist(j,5)){
                  fu.kotsu+=4;
                }
                //杠
                else if(tehai.furo.exist(j,6)||tehai.furo.exist(j,7)||tehai.furo.exist(j,8)||tehai.furo.exist(j,10)||tehai.furo.exist(j,11)||tehai.furo.exist(j,12)){
                  fu.kotsu+=16;
                }
                //暗杠
                else if(tehai.furo.exist(j,9)){
                  fu.kotsu+=32;
                }
                //手牌中暗刻
                else{
                  fu.kotsu+=8;
                }
                break;
              default:
                if(tehai.furo.exist(j,3)||tehai.furo.exist(j,4)||tehai.furo.exist(j,5)){
                  fu.kotsu+=2;
                }
                //杠
                else if(tehai.furo.exist(j,6)||tehai.furo.exist(j,7)||tehai.furo.exist(j,8)||tehai.furo.exist(j,10)||tehai.furo.exist(j,11)||tehai.furo.exist(j,12)){
                  fu.kotsu+=8;
                }
                //暗杠
                else if(tehai.furo.exist(j,9)){
                  fu.kotsu+=16;
                }
                //手牌中暗刻
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
      else {
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
        if (tehai.agari.result[i].ko[31]) {
            han.yaku_haku = 1;
        }
        if (tehai.agari.result[i].ko[32]) {
            han.yaku_hatsu = 1;
        }
        if (tehai.agari.result[i].ko[33]) {
            han.yaku_chun = 1;
        }
        if (tehai.agari.result[i].ko[tehai.ji]) {
            han.yaku_jikaze = 1;
        }
        if (tehai.agari.result[i].ko[tehai.ba]) {
            han.yaku_bakaze = 1;
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
              if(tehai.furo.noFuro(j)){
                if(j!==tehai.agariHai){
                  anko++;
                }
              }
              if(tehai.furo.exist(j,9)){
                anko++;
                kan++;
              }
              if(tehai.furo.exist(j,6)||tehai.furo.exist(j,7)||tehai.furo.exist(j,8)||tehai.furo.exist(j,10)||tehai.furo.exist(j,11)||tehai.furo.exist(j,12)){
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
          //magic number indicating the pattern types
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
                if(pattern[0]!==0){
                  type = 0;
                }
                if(pattern[1]!==0){
                  type = 1;
                }
                if(pattern[2]!==0){
                  type = 2;
                }
                //111 123 456 789 99
                if(tehai.agari.result[i].ko[type*9]
                  &&tehai.agari.result[i].syon[type*9]
                  &&tehai.agari.result[i].syon[type*9+3]
                  &&tehai.agari.result[i].syon[type*9+6]
                  &&tehai.agari.result[i].jyan===type*9+8){
                  han.churen = 13;
                }
                //111 234 456 789 99
                if(tehai.agari.result[i].ko[type*9]
                  &&tehai.agari.result[i].syon[type*9+1]
                  &&tehai.agari.result[i].syon[type*9+3]
                  &&tehai.agari.result[i].syon[type*9+6]
                  &&tehai.agari.result[i].jyan===type*9+8){
                  han.churen = 13;
                }
                //111 234 567 789 99
                if(tehai.agari.result[i].ko[type*9]
                  &&tehai.agari.result[i].syon[type*9+1]
                  &&tehai.agari.result[i].syon[type*9+4]
                  &&tehai.agari.result[i].syon[type*9+6]
                  &&tehai.agari.result[i].jyan===type*9+8){
                  han.churen = 13;
                }
                //111 22 345 678 999
                if(tehai.agari.result[i].ko[type*9]
                  &&tehai.agari.result[i].ko[type*9+8]
                  &&tehai.agari.result[i].syon[type*9+2]
                  &&tehai.agari.result[i].syon[type*9+5]
                  &&tehai.agari.result[i].jyan===type*9+1){
                  han.churen = 13;
                }
                //111 234 55 678 999
                if(tehai.agari.result[i].ko[type*9]
                  &&tehai.agari.result[i].ko[type*9+8]
                  &&tehai.agari.result[i].syon[type*9+1]
                  &&tehai.agari.result[i].syon[type*9+5]
                  &&tehai.agari.result[i].jyan===type*9+4){
                  han.churen = 13;
                }
                //111 234 567 88 999
                if(tehai.agari.result[i].ko[type*9]
                  &&tehai.agari.result[i].ko[type*9+8]
                  &&tehai.agari.result[i].syon[type*9+1]
                  &&tehai.agari.result[i].syon[type*9+4]
                  &&tehai.agari.result[i].jyan===type*9+7){
                  han.churen = 13;
                }
                //11 123 345 678 999
                if(tehai.agari.result[i].ko[type*9+8]
                  &&tehai.agari.result[i].syon[type*9]
                  &&tehai.agari.result[i].syon[type*9+2]
                  &&tehai.agari.result[i].syon[type*9+5]
                  &&tehai.agari.result[i].jyan===type*9){
                  han.churen = 13;
                }
                //11 123 456 678 999
                if(tehai.agari.result[i].ko[type*9+8]
                  &&tehai.agari.result[i].syon[type*9]
                  &&tehai.agari.result[i].syon[type*9+3]
                  &&tehai.agari.result[i].syon[type*9+5]
                  &&tehai.agari.result[i].jyan===type*9){
                  han.churen = 13;
                }
                //11 123 456 789 999
                if(tehai.agari.result[i].ko[type*9+8]
                  &&tehai.agari.result[i].syon[type*9]
                  &&tehai.agari.result[i].syon[type*9+3]
                  &&tehai.agari.result[i].syon[type*9+6]
                  &&tehai.agari.result[i].jyan===type*9)
                    han.churen = 13;
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
        ||tehai.agari.result[i].han.chihou) {
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
        if(tehai.agari.result[i].han[j]&&tehai.agari.result[i].han.hasOwnProperty(j)){
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
      if(tehai.agari.result[i].han.count>0){
        var basePoint = tehai.agari.result[i].fu.count*Math.pow(2,tehai.agari.result[i].han.count+2);
        if(basePoint>=2000){
          if(tehai.agari.result[i].han.count)
          switch(tehai.agari.result[i].han.count){
            case 3:
            case 4:
            case 5:
              tehai.agari.result[i].basePoint = 2000;
              break;
            case 6:
            case 7:
              tehai.agari.result[i].basePoint = 3000;
              break;
            case 8:
            case 9:
            case 10:
              tehai.agari.result[i].basePoint = 4000;
              break;
            case 11:
            case 12:
              tehai.agari.result[i].basePoint = 6000;
              break;
            case 13:
              tehai.agari.result[i].basePoint = 8000;
              break;
          }
        }
        else{
          tehai.agari.result[i].basePoint = basePoint;
        }
      }
    }
  };
  var highestPoint = function(tehai){
    var index = 0;
    for(var i=0;i<tehai.agari.result.length;i++){
      if(tehai.agari.result[i].basePoint>tehai.agari.result[index].basePoint){
        index = i;
      }
    }
    tehai.agari.final = Math.ceil(tehai.agari.result[index]/100)*100;
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
      highestPoint(tehai);
    }
    return tehai;
  };
}();

//need login for advanced user auth
var ioResponse = function(io){

  var online = 0;

  var playerQueue = [];



  var hostInit = function(){
    if(playerQueue.length>=4){
      var players = [];
      for(var i=0;i<4;i++){
        players.push(playerQueue.shift());
        players[i].number = i;
        players[i].tehai = new Tehai();
      }
      var gameOperate = hostCreate(players);
      for(var i=0;i<4;i++){
        players[i].operate = gameOperate;
      }
      for(var i=0;i<4;i++){
        players[i].emit('full');
      }
    }
  };
  //岭上牌4张
  //宝牌10张
  //起手牌52张
  //摸牌70张
  var hostCreate = function(participants){
    var players = participants;
    players[0].ready = false;
    players[1].ready = false;
    players[2].ready = false;
    players[3].ready = false;
    //一局进行状态
    //-2:结束
    //-1:等待开始
    //0-3:等待对应玩家出牌
    //bit 3-6(4-63)             :等待玩家吃牌
    //bit 7-10(64-1023)         :等待玩家碰牌
    //bit 11-14(1024-16383)     :等待玩家杠牌
    //bit 15-18(16384-262143)   :等待玩家和牌
    //bit 19-22(262144-4194903) :等待玩家立直
    //后两者可进行复合
    var state = -1;
    var round = 0;
    var lastPlay = {
      player: -1,
      hai: -1
    };
    var yama = new Yama();
    var operationQueue = new OperationQueue();
    var nextPlayer = function(current,pos){
      var shift = pos||1;
      return (current+shift)%4;
    };
    var addHai = function(player, hai){
      player.tehai.haiIndex.push(hai);
      player.tehai.hai[Math.floor(hai/4)]++;
      player.tehai.validHai[Math.floor(hai/4)]++;
    };
    var popHai = function(player, hai){
      player.tehai.haiIndex.pop();
      player.tehai.hai[Math.floor(hai/4)]--;
      player.tehai.validHai[Math.floor(hai/4)]--;
    };
    var deleteHai = function(player, hai){
      player.tehai.haiIndex.splice(player.tehai.haiIndex.indexOf(hai),1);
      player.tehai.hai[Math.floor(hai/4)]--;
      player.tehai.validHai[Math.floor(hai/4)]--;
    };
    var deleteIndexFuzzy = function(player, index){
      for(var i=0;i<4;i++){
        if(player.tehai.haiIndex.indexOf(index*4+(3-i))!==-1){
          return player.tehai.haiIndex.splice(player.tehai.haiIndex.indexOf(index*4+(3-i)),1);
        }
      }
    };
    var getReady = function(player){
      players[player].ready = true;
    };
    var isReady = function(){
      return players[0].ready&&players[1].ready&&players[2].ready&&players[3].ready;
    };
    var roundInit = function(player){
      player.tehai.haiIndex = [];
      player.tehai.hai = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
      player.tehai.validHai = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
      player.tehai.furo = new Furo();
      player.tehai.dora = [0,0,0,0,0];
      player.tehai.discard = [];
      player.tehai.agariHai = null;
      player.tehai.agariFrom = null;
      player.tehai.chitoi = false;
      player.tehai.kokushi = false;
      player.tehai.first = false;
      player.tehai.last = false;
      player.tehai.riichi = false;
      player.tehai.riichiReady = false;
      player.tehai.ippatsu = false;
      player.tehai.rinsyan = false;
      player.tehai.double = false;
      player.tehai.chankan = false;
      player.tehai.nakashi = false;
    };
    var tehaiMerger = function(player){
      //player parameter is player number
      // new object to return
      var tehai = {
        point: [],
        haiIndex: players[player].tehai.haiIndex,
        discard: [],
        furo: [],
        round: players[player].tehai.round,
        ji: players[player].tehai.ji,
        ba: players[player].tehai.ba,
        dora: players[player].tehai.dora
      };
      for(var i=0;i<4;i++){
        tehai.point[i] = players[(player+i)%4].tehai.point;
        tehai.discard[i] = players[(player+i)%4].tehai.discard;
        tehai.furo[i] = players[(player+i)%4].tehai.furo.data;
      }
      return tehai;
    };
    var discardMerger = function(player){
      //player parameter is player number
      // new object to return
      var discard = [[],[],[],[]];
      for(var i=0;i<4;i++){
        discard[i] = players[(player+i)%4].tehai.discard;
      }
      return discard;
    };
    var furoMerger = function(player){
      //player parameter is player number
      // new object to return
      var furo = [];
      for(var i=0;i<4;i++){
        furo[i] = players[(player+i)%4].tehai.furo.data;
      }
      return furo;
    };
    //摸牌
    var playerDraw = function(player,type){
      var drawHai = null;
      if(type==='normal'){
        drawHai = yama.drawHead();
      }
      if(type==='kan'){
        drawHai = yama.drawTail();
      }
      if(type==='empty'){
        drawHai = null;
      }
      else{
        lastPlay.player = player.number;
        lastPlay.hai = drawHai;
        var result = operationDetect(player, lastPlay, true);
        operationSet(player,result);
        addHai(player,drawHai);
      }
      //发送摸牌数据
      //state的变化在打牌之后
      player.emit('draw',{
        turn: player.tehai.ji,
        hai: drawHai,
        kan: result&&result.kan,
        agari: result&&result.agari,
        riichi: result&&result.riichi
      })
    };
    //一局结束(以及整场结束)
    var roundEnd = function(result){
      for(var i = 0; i < players.length; i++){
        players[i].emit("roundEnd", result);
        for(var j=0;j<result.length;j++){
          result[j].data.player += 3;
          result[j].data.player %= 4;
          result[j].data.oya += 3;
          result[j].data.oya %= 4;
          result[j].data.agariFrom += 3;
          result[j].data.agariFrom %= 4;
        }
      }
      //等待准备
      players[0].ready = false;
      players[1].ready = false;
      players[2].ready = false;
      players[3].ready = false;
      //局数提升
      round++;
      if(round<8){
        state = -1;
      }
      else{
        state = -2;
        for(var i=0;i<4;i++){
          players[i].emit('gameEnd');
        }
      }
    };
    //中断操作查询
    var operationDetect = function(player, lastPlay, isDraw){
      var result = new Operation();
      result.tile = lastPlay.hai;
      addHai(player,lastPlay.hai);
      if(!isDraw){
        //仅下家可吃,去除字牌
        if(player.number===nextPlayer(lastPlay.player)&&Math.floor(lastPlay.hai/4)<27){
          //1位
          if(Math.floor(lastPlay.hai/4)%9<7){
            if(player.tehai.validHai[Math.floor(lastPlay.hai/4)+1]>0&&player.tehai.validHai[Math.floor(lastPlay.hai/4)+2]>0){
              result.data.push(0);
            }
          }
          //2位
          if(Math.floor(lastPlay.hai/4)%9<8&&Math.floor(lastPlay.hai/4)%9>0){
            if(player.tehai.validHai[Math.floor(lastPlay.hai/4)-1]>0&&player.tehai.validHai[Math.floor(lastPlay.hai/4)+1]>0){
              result.data.push(1);
            }
          }
          //3位
          if(Math.floor(lastPlay.hai/4)%9>1){
            if(player.tehai.validHai[Math.floor(lastPlay.hai/4)-2]>0&&player.tehai.validHai[Math.floor(lastPlay.hai/4)-1]>0){
              result.data.push(2);
            }
          }
        }
        //碰
        //仅在该牌在有效手牌中有3张以上张时才能操作
        if(player.tehai.validHai[Math.floor(lastPlay.hai/4)]>=3){
          result.data.push(2+(4+player.number-lastPlay.player)%4);
        }
        //明杠
        //仅在该牌在有效手牌中有4张时才能操作
        if(player.tehai.validHai[Math.floor(lastPlay.hai/4)]===4){
          result.data.push(5+(4+player.number-lastPlay.player)%4);
        }
      }
      else{
        //暗杠(实际跟明杠一样,只是触发阶段不一样)
        //仅在该牌在有效手牌中有4张时才能操作
        if(player.tehai.validHai[Math.floor(lastPlay.hai/4)]===4){
          result.data.push(9);
        }
        //加杠
        //仅在该牌已有一个碰时才能操作
        if(player.tehai.furo.exist(Math.floor(lastPlay.hai/4),3)||player.tehai.furo.exist(Math.floor(lastPlay.hai/4),4)||player.tehai.furo.exist(Math.floor(lastPlay.hai/4),5)){
          result.data.push(10);
        }
        //立直
        if(!player.tehai.riichi&&player.tehai.furo.riichi()&&syanten(player.tehai).result<=0){
          result.data.push(14);
        }
      }
      //和
      var test = clone(player.tehai);
      test.agariFrom = (lastPlay.player-player.number+4)%4;
      test.agariHai = Math.floor(lastPlay.hai/4);
      agariCheck(test);
      if(test.agari.count){
        //最后打(摸)牌的玩家相对于当前玩家的位置
        agariPoint(test);
        if(test.agari.final.basePoint){
          //result.agari = true;
          result.data.push(13);
        }
      }
      popHai(player,lastPlay.hai);
      //console.log('operation', result, 'is draw', isDraw);
      return result;
    };
    var operationSet = function(player, operation){
      for(var i=0;i<operation.data.length;i++){
        switch(operation.data[i]){
          //吃
          case 0:
          case 1:
          case 2:
            state+=4*Math.pow(2,player.number);//置等待吃牌标记位
            break;
          //碰
          case 3:
          case 4:
          case 5:
            state+=64*Math.pow(2,player.number);//置等待碰牌标记位
            break;
          //杠
          case 6:
          case 7:
          case 8:
          //暗杠
          case 9:
          //加杠
          case 10:
            state+=1024*Math.pow(2,player.number);//置等待杠牌标记位
            break;
          //和
          case 13:
            state+=16384*Math.pow(2,player.number);//置等待和牌标记位
            break;
          //立直
          case 14:
            state+=262144*Math.pow(2,player.number);//置等待立直标记位
            break;
        }
      }
      if(operation.data.length>0){
        player.emit('operation',operation);
      }
    };
    var operationPass = function(number){
      //取消该玩家的全部标志位
      //取消吃
      if(state&4*Math.pow(2,number)){
        state-=4*Math.pow(2,number);
      }
      //取消碰
      if(state&64*Math.pow(2,number)){
        state-=64*Math.pow(2,number);
      }
      //取消杠
      if(state&1024*Math.pow(2,number)){
        state-=1024*Math.pow(2,number);
      }
      //取消和
      if(state&16384*Math.pow(2,number)){
        state-=16384*Math.pow(2,number);
      }
      //取消立直
      if(state&262144*Math.pow(2,number)){
        state-=262144*Math.pow(2,number);
      }
    };
    var operationHandle = function(){
      //TODO: 从弃牌中移除牌
      if(state>=0&&state<4){
        //没有更多的操作需要等待响应
        //从操作队列中选择本回合会进行的操作进行处理
        if(operationQueue.result()[0] !== undefined){
          var result = operationQueue.result()[0];
          var tile = Math.floor(result.data.tile/4);
          switch(result.operation){
            //把副露牌加入自己的牌中
            case 'chi':
              if(result.data.value === 0){
                players[result.player].tehai.hai[tile]++;
                players[result.player].tehai.validHai[tile + 1]--;
                players[result.player].tehai.validHai[tile + 2]--;
                deleteIndexFuzzy(players[result.player], tile + 1);
                deleteIndexFuzzy(players[result.player], tile + 2);
                players[result.player].tehai.furo.set(tile, result.data.value);
              }
              if(result.data.value === 1){
                players[result.player].tehai.hai[tile]++;
                players[result.player].tehai.validHai[tile - 1]--;
                players[result.player].tehai.validHai[tile + 1]--;
                deleteIndexFuzzy(players[result.player], tile - 1);
                deleteIndexFuzzy(players[result.player], tile + 1);
                players[result.player].tehai.furo.set(tile, result.data.value);
              }
              if(result.data.value === 2){
                players[result.player].tehai.hai[tile]++;
                players[result.player].tehai.validHai[tile - 2]--;
                players[result.player].tehai.validHai[tile - 1]--;
                deleteIndexFuzzy(players[result.player], tile - 2);
                deleteIndexFuzzy(players[result.player], tile - 1);
                players[result.player].tehai.furo.set(tile, result.data.value);
              }
              //向所有玩家发送副露数据
              for(var i=0;i<4;i++){
                players[i].emit('furo', {
                  tehai: tehaiMerger(i)
                });
              }
              //从弃牌中移除
              players[state&4].tehai.discard.pop();
              //空摸牌，置state
              state = result.player;
              playerDraw(players[result.player], 'empty');
              break;
            case 'pon':
              players[result.player].tehai.hai[tile]++;
              players[result.player].tehai.validHai[tile] -= 2;
              deleteIndexFuzzy(players[result.player], tile);
              deleteIndexFuzzy(players[result.player], tile);
              players[result.player].tehai.furo.set(tile, result.data.value);
              //向所有玩家发送副露数据
              for(var i=0;i<4;i++){
                players[i].emit('furo', {
                  tehai: tehaiMerger(i)
                });
              }
              //从弃牌中移除
              players[state&4].tehai.discard.pop();
              //空摸牌，置state
              state = result.player;
              playerDraw(players[result.player], 'empty');
              break;
            case 'kan':
              //明杠
              if(result.data.value < 9){
                players[result.player].tehai.validHai[tile] -= 3;
                deleteIndexFuzzy(players[result.player], tile);
                deleteIndexFuzzy(players[result.player], tile);
                deleteIndexFuzzy(players[result.player], tile);
                players[result.player].tehai.furo.set(tile, result.data.value);
                //从弃牌中移除
                players[state&4].tehai.discard.pop();
              }
              //暗杠
              if(result.data.value === 9){
                players[result.player].tehai.hai[tile]--;
                players[result.player].tehai.validHai[tile] -= 4;
                deleteIndexFuzzy(players[result.player], tile);
                deleteIndexFuzzy(players[result.player], tile);
                deleteIndexFuzzy(players[result.player], tile);
                deleteIndexFuzzy(players[result.player], tile);
                players[result.player].tehai.furo.set(tile, result.data.value);
              }
              //加杠
              if(result.data.value > 9){
                players[result.player].tehai.validHai[tile]--;
                deleteIndexFuzzy(players[result.player], tile);
                players[result.player].tehai.furo.upgrade(tile);
              }
              //向所有玩家发送副露数据
              for(var i=0;i<4;i++){
                players[i].emit('furo', {
                  tehai: tehaiMerger(i)
                });
              }
              //摸岭上牌，置state
              state = result.player;
              playerDraw(players[result.player], 'kan');
              break;
            case 'agari':
              // var result = {
              //   player: this.number,
              //   oya: this.tehai.ji-27;
              //   haiIndex: this.tehai.haiIndex,
              //   furo: this.tehai.furo,
              //   agariFrom: this.tehai.agariFrom,
              //   agariHai: this.tehai.agariHai,
              //   fu: this.tehai.agari.final.fu,
              //   han: this.tehai.agari.final.han,
              //   basePoint: this.tehai.agari.final.basePoint
              // };
              result = operationQueue.result();
              for(var i = 0; i < result.length; i++){
                //TODO: 考虑重做tehai中分数表示
                //在结算时只结算每个人各自的分数
                //开局时或结算完成后玩家分数交换数据更新
                if(result[i].data.oya === 0){
                  if(result[i].data.agariFrom === 0){
                    players[result[i].data.player].tehai.point += result[i].data.basePoint * 6;
                    players[(result[i].data.player + 1) % 4].tehai.point -= result[i].data.basePoint * 2;
                    players[(result[i].data.player + 2) % 4].tehai.point -= result[i].data.basePoint * 2;
                    players[(result[i].data.player + 3) % 4].tehai.point -= result[i].data.basePoint * 2;
                  }
                  else{
                    players[result[i].data.player].tehai.point += result[i].data.basePoint * 6;
                    players[(4+result[i].data.agariFrom-result[i].data.player)%4].tehai.point -= result[i].data.basePoint * 6;
                  }
                }
                else{
                  if(result[i].data.agariFrom === 0){
                    players[result[i].data.player].tehai.point[0] += result[i].data.basePoint * 4;
                    players[(result[i].data.player + 1) % 4].tehai.point -= result[i].data.basePoint * 1;
                    players[(result[i].data.player + 2) % 4].tehai.point -= result[i].data.basePoint * 1
                    players[(result[i].data.player + 3) % 4].tehai.point -= result[i].data.basePoint * 1;
                    players[(4+4 - result[i].data.oya-result[i].data.player)%4].tehai.point -= result[i].data.basePoint * 1;
                  }
                  else{
                    players[result[i].data.player].tehai.point += result[i].data.basePoint * 4;
                    players[(4+result[i].data.agariFrom-result[i].data.player)%4].tehai.point -= result[i].data.basePoint * 4;
                  }
                }
              }
              roundEnd(result);
              break;
          }
        }
        //可以摸牌了
        //还有牌
        else if(yama.getLength() > 10){
          //下家摸牌
          state = nextPlayer(state);
          playerDraw(players[state], 'normal');
        }
        //流局
        else{
          roundEnd();
        }
      }
    };
    var playerReady = 0;
    return function(instruction,param){
      switch(instruction){
        case 'ready':
          //if(state===-1&&playerReady<4&&playerReady>=0)playerReady++;
          //if(playerReady>=4){
          getReady(this.number);
          if(isReady()){
            playerReady = 0;


            //初始化牌山
            yama.init();
            //TODO: 测试用牌山
            //yama.data = [93,100,122,36,82,131,75,118,21,13,37,60,30,49,27,130,129,
            //              80,101,20,91,57,26,134,38,113,108,120,116,31,83,29,51,112,
            //              62,85,69,128,109,23,0,97,7,42,11,87,121,48,117,1,126,
            //              135,55,15,44,52,3,111,66,76,58,50,46,16,2,67,78,89,
            //              105,35,8,65,92,115,70,12,41,40,64,94,98,107,81,32,33,
            //              103,9,25,68,59,114,127,17,56,43,74,19,104,14,119,6,96,
            //              90,10,24,86,4,125,132,102,110,54,39,47,77,18,106,61,72,
            //              63,45,84,99,34,5,79,88,133,28,95,123,22,53,124,73,71];
            //bug牌山（
            //yama.data = [0,1,2,3,19,20,24,40,109,110,111,112,83,88,89,91,4,5,6,7,44,48,31,30,113,114,116,117,96,104,108,101,8,10,9,11,58,60,64,84,118,120,121,124,82,126,127,128,12,85,125,123,14,86,129,122,51,119,71,72,59,28,23,74,49,93,36,100,102,99,97,43,92,47,45,75,34,65,95,52,73,135,33,70,94,56,38,29,80,63,18,69,76,133,41,13,103,79,42,81,61,55,53,98,105,54,115,131,22,78,25,46,35,32,134,27,68,15,130,17,67,50,62,26,37,106,21,87,132,90,107,57,39,77,16,66]
            console.log(JSON.stringify(yama));
            //初始化该局变量
            for(var i=0;i<4;i++){
              roundInit(players[i]);
            }
            for(var i=0;i<12*4;i++){
              var drawHai = yama.drawHead();
              addHai(players[(round+Math.floor(i/4)%4)%4],drawHai);
            }
            for(var i=0;i<4;i++){
              var drawHai = yama.drawHead();
              addHai(players[(round+i)%4],drawHai);
              players[(round+i)%4].tehai.round = round;
              players[(round+i)%4].tehai.ji = 27+(4-round%4+i)%4;
              players[(round+i)%4].tehai.ba = 27+Math.floor(round/4);
            }
            //TODO: 过滤和交换tehai数据
            for(var i=0;i<4;i++){
              players[i].emit('start',{
                tehai: tehaiMerger(i)
              });
            }
            //置状态为开始状态,庄家摸牌
            state = round%4;
            var whoDraw = players[state];
            for(var i=0;i<4;i++){
              if(i===state){
                playerDraw(whoDraw,'normal');
                //console.log(players[state].tehai.haiIndex);
              }
              else{
                players[i].emit('draw', {
                  turn: whoDraw.tehai.ji,
                  hai: null,
                  kan: null,
                  agari: null,
                  riichi: null
                })
              }
            }
          }
          break;
        case 'discard':
          if(state===this.number){
            if(this.tehai.haiIndex.indexOf(param)!==-1){
              if(this.tehai.riichiReady){
                deleteHai(this,param);
                if(syanten(this.tehai).result!==0){
                  addHai(this,param);
                  return {status: 'error', text: 'invalid riichi discard'};
                }
                else{
                  addHai(this,param);
                  this.tehai.riichiReady = false;
                }
              }
              else{
                if(this.tehai.riichi){
                  if(this.tehai.haiIndex[this.tehai.haiIndex.length-1]!==param){
                    return {status: 'error', text: 'invalid riichi discard.'};
                  }
                }
              }
              //初始化操作队列
              operationQueue.reset();
              //从手牌中移除
              deleteHai(this,param);
              //将打牌置入弃牌对象中
              players[this.number].tehai.discard.push(param);
              //分发打牌数据
              for(var i=0;i<4;i++){
                players[i].emit('discarded', {
                  discard: discardMerger(i)
                });
              }
              //记录打牌
              lastPlay.player = this.number;
              lastPlay.hai = param;

              //检查是否有中断操作
              for(var i=0;i<4;i++){
                if(i===state){
                  continue;
                }
                var result = operationDetect(players[i],lastPlay);
                operationSet(players[i],result);
              }
              //检查当前state，如果有操作标志位则结束流程，等待player操作
              if(state>=0&&state<4){
                //无事发生直接摸牌
                if(yama.getLength()>10){
                  //下家摸牌
                  state = nextPlayer(state);
                  var whoDraw = players[state];
                  for(var i=0;i<4;i++){
                    if(i===state){
                      playerDraw(whoDraw,'normal');
                      //console.log(players[state].tehai.haiIndex);
                    }
                    else{
                      players[i].emit('draw', {
                        turn: whoDraw.tehai.ji,
                        hai: null,
                        kan: null,
                        agari: null,
                        riichi: null
                      })
                    }
                  }
                }
                else{
                  //没牌了
                  roundEnd();
                }
              }
            }
            else{
              //牌不存在
              //error handling. disconnect etc.
              return {status: 'error', text: 'non-exist card when discarding'};
            }
          }
          else{
            //state不对
            //error handling. disconnect etc.
            return {status: 'error', text: 'wrong state when discarding'};
          }
          break;
        //统一更换为operation,param为
        //  type:方法
        //  index:副露的牌
        //  value:副露的值
        case 'operation':
          switch(param.value){
            //所有操作push到操作队列中
            //因为state在服务器端置值，所以不需要做可用判断?
            //最终操作移到外面
            case 1:
            case 2:
            case 3:
              if(state&4*Math.pow(2,this.number)){
                //将结算放入队列
                operationQueue.push({
                  'operation': 'chi',
                  'player': this.number,
                  'data': {
                    'tile': param.tile,
                    'value': param.value-1
                  }
                });
                operationPass(this.number);
                operationHandle();
              }
              break;
            case 5:
              if(state&64*Math.pow(2,this.number)){
                //将结算放入队列
                operationQueue.push({
                  'operation': 'pon',
                  'player': this.number,
                  'data': {
                    'tile': param.tile,
                    'value': 2+(lastPlay.player+4-this.number)%4
                  }
                });
                operationPass(this.number);
                operationHandle();
              }
              break;
            case 6:
              if(state&1024*Math.pow(2,this.number)){
                //将结算放入队列
                if(this.tehai.validHai[param.tile]===3){
                  //明杠
                  operationQueue.push({
                    'operation': 'kan',
                    'player': this.number,
                    'data': {
                      'tile': param.tile,
                      'value': 5+(lastPlay.player+4-this.number)%4
                    }
                  });
                }
                else if(this.tehai.validHai[param.tile]===4){
                  //暗杠
                  operationQueue.push({
                    'operation': 'kan',
                    'player': this.number,
                    'data': {
                      'tile': param.tile,
                      'value': 9
                    }
                  });
                }
                else{
                  //余下的情况为加杠（已有一个碰的情况）
                  //操作值定义为固定10，处理时进行加杠升级操作
                  operationQueue.push({
                    'operation': 'kan',
                    'player': this.number,
                    'data': {
                      'tile': param.tile,
                      'value': 10
                    }
                  });
                }
                operationPass(this.number);
                operationHandle();
              }
              break;
            case 4:
              //和牌不需要额外数据
              if(state&16384*Math.pow(2,this.number)){
                if(this.tehai.haiIndex.length<14){
                  addHai(this,lastPlay.hai);
                }
                this.tehai.agariHai = Math.floor(lastPlay.hai/4);
                this.tehai.agariFrom = (lastPlay.player-this.number+4)%4;
                agariCheck(this.tehai);
                //理论上成功进到这里应为可以和的牌型
                if(this.tehai.agari.count){
                  agariPoint(this.tehai);
                  //计算和牌结果
                  var result = {
                    player: this.number,
                    oya: this.tehai.ji-27,
                    haiIndex: this.tehai.haiIndex,
                    furo: this.tehai.furo,
                    agariFrom: this.tehai.agariFrom,
                    agariHai: this.tehai.agariHai,
                    fu: this.tehai.agari.final.fu,
                    han: this.tehai.agari.final.han,
                    basePoint: this.tehai.agari.final.basePoint
                  };
                  //将结算放入队列
                  operationQueue.push({
                    operation: 'agari',
                    data: result
                  });
                }
                operationPass(this.number);
                operationHandle();
              }
              else{
                //state不对
                //error handling. disconnect etc.
              }
              break;
            case 0:
              //因为立直只会在自摸时触发
              //故不需要将其置入队列
              //暗杠和加杠也不需要，但与明杠混合，置入队列也无影响
              //
              //TODO: 完成立直
              //2017/05/01
              //立直时置两个标记
              //一置立直状态
              //二置当前立直弃牌
              //弃牌标记在弃牌时对牌进行有效检测
              this.tehai.riichi = true;
              this.tehai.riichiReady = true;
              operationPass(this.number);
              //立直不需要handle
              //等待弃牌
              break;
            case 7:
              //玩家放弃操作时直接进入此部分
              operationPass(this.number);
              operationHandle();
              break;
          }
          break;
        case 'disconnect':
          break;
      }
      return {status: 'success', state: state};
    }
  };

  //player:join
  //server:full
  //player:ready
  //server:start(with initial hand)
  //player:operation
  //  discard
  //  operation
  //    chi
  //    pon
  //    kan
  //    agari
  //    pass
  //server:response
  //  draw
  //  operation
  //    chi
  //    pon
  //    kan
  //    hu
  //  roundEnd(with data if someone hu'ed)
  //  gameEnd
  io.on('connection', function(socket){
    online++;
    console.log(socket.id + ' Log in. Online: ' + online);

    socket.on('join', function(){
      var pos = playerQueue.indexOf(socket);
      if(pos===-1)playerQueue.push(socket);
      console.log('Current in queue: ' + playerQueue.length);
      if(playerQueue.length>=4){
        hostInit();
      }
    });

    socket.on('ready', function(){
      socket.operate('ready');
    });
    socket.on('discard', function(data, fn){
      var ret = socket.operate('discard',data.value);
      if(ret.status==='error'){
        console.log('Player ' + socket.number + ' ' + ret.text)
      }
      else{
        console.log('Player ' + socket.number + ' discarded ' + data.value);
        console.log('State: ', ret.state);
        fn('success');
      }
    });
    socket.on('operation', function(param, fn){
      var ret = socket.operate('operation', param);
      if(ret.status==='error'){
        console.log('Player ' + socket.number + ' ' + ret.text)
      }
      else{
        console.log('Player ' + socket.number + ' operate ' , param);
        console.log('State: ', ret.state);
        fn();
      }
    });

    socket.on('disconnect', function(){
      online--;
      var pos = playerQueue.indexOf(socket);
      if(pos!==-1)playerQueue.splice(pos,1);
      console.log(socket.id + ' Log out. Online: ' + online);
    });
  });
};


module.exports = {router: router, socket: ioResponse};
