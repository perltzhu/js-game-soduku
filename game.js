/**
 * Author  Perlt
 * http://zhenpengday.blog.163.com
 * 
 * A sudoku game 
 *
 **/
var Shudu = {
 
 //存储每个格子对象数组
 ceils : [[],[],[],[],[],[],[],[],[],[]],
 
 //数独游戏的难度
 level : 3,
 
 //某一个解的例子
 example : [],
 
 //当前用户输入的解
 nowResult : [],
 
 //保存所以不符合条件的点
 failPoint : [],
 
 //时间运行对象
 timeObj : {sign : null, h : 0, m : 0, s : 0},
 
 //初始化
 init : function() {
  
  var doc = document;
  var shuduTable = doc.getElementById("shudu");
  var ceilTables = shuduTable.getElementsByTagName("table");
  var ctLen = ceilTables.length;
  var l, d, ll, dd;
  
  //再次初始化
  var ceils = this.ceils;
  
  //数组初始化
  for (var i = 0; i < ctLen; i++) {
   //获取行列值
   l = Math.floor(i / 3);
   d = i % 3;
   
   var trs = ceilTables[i].rows;
   var trLen = trs.length;
   
   for (var k = 0; k < trLen; k++ ) {
    var tds = trs[k].cells;
    var tdLen = tds.length;
    
    //获取实际的行值
    ll = l * 3 + k + 1;
    
    for (var c = 0; c < tdLen; c++) {
     //获取实际的列值
     dd = d * 3 + c + 1;
     
     var td = tds[c];
     td.setAttribute("row", ll);
     td.setAttribute("col", dd);
     ceils[ll][dd] = td;
    }
    
   }
   
  }
 },
 
 //运行函数
 run : function() {
  this.endTime();
  this.beginTime();
  this.clearData();
  this.resetData();
  this.bindEvent();
 },
 
 //清空所有数据
 clearData : function() {
  //清除表格数据
  var ceils = this.ceils;
  var i,k;
  for (i = 1; i <= 9; i++) {
   for (k = 1; k <= 9; k++) {
    var ceil = ceils[i][k];
    //清除事件绑定
    if ( ceil.getAttribute("read") == "no") {
     var input = ceil.getElementsByTagName("input")[0];
     removeEvent(input, "blur", this.blurHandler); 
     removeEvent(input, "keypress", this.keypressHandler); 
    }
    
    ceil.className = "";
    ceil.innerHTML = "";
    ceil.setAttribute("td_value", '');
   }
  }
  
  //初始化各个属性
  this.example = [[],[],[],[],[],[],[],[],[],[]];
  this.nowResult = [[],[],[],[],[],[],[],[],[],[]];
  this.failPoint = [[],[],[],[],[],[],[],[],[],[]];
  this.timeObj = {sign : null, h : 0, m : 0, s : 0};
 },
 
 //重新设定数据
 resetData : function() {
  //设置难度等级
  //this.level = document.getElementById("level").value;
  this.level = parseInt(document.getElementById("level").value);
  var doc = document;
  var example = this.example;
  var failPoint = this.failPoint;
  var ceils = this.ceils;
  var nowResult = this.nowResult;
  
  //获得可行解
  var result = this.cSolution();
  
  //设置解的例子，和当前用户的解
  for (i = 1; i <= 9; i++) {
   for (k = 1; k <= 9; k++) {
    example[i][k] = result[i][k];
   }
  }
  
  //所以打乱所有解，得出问题
  this.cRandomResult(result);
  
  //渲染表格,并且初始化当前解，和不符合条件点
  for (i = 1; i <= 9; i++) {
   for (k = 1; k <= 9; k++) {
    var ceil = ceils[i][k];
    var value = result[i][k];
    nowResult[i][k] = value;
    failPoint[i][k] = false;
    
    //设置TD值
    ceil.setAttribute("td_value", value);
    
    //如果没有值，说明是用户填写答案地方
    if (value == '') {
     //产生节点
     var div = doc.createElement("div");
     var input = doc.createElement("input");
     input.type = "text";
     input.value = "";
     input.className = "input_no";
     input.maxLength = 1;
     input.setAttribute("text_input", 1);
     
     ceil.appendChild(input);
     ceil.appendChild(div);
     
     //设置只读标志符
     ceil.setAttribute("read", 'no');
     //设置样式
     ceil.className = "td_nor";
    } else {
     //设置只读标志符
     ceil.innerHTML = value;
     ceil.setAttribute("read", 'yes');
    }
    
   }
  }
 },
  
 //绑定事件
 bindEvent : function() {
  //为整个表格添加点击事件
  var table = document.getElementById("shudu");
  addEvent(table, "click", this.clickHandler);
  
  //为用户可以操作的格子添加失去焦点事件
  var ceils = this.ceils;
  var i, k;
  for (i = 1; i <= 9; i++) {
   for (k = 1; k <= 9; k++) {
    var el = ceils[i][k];
    if (el.getAttribute("read") == 'no') {
     var input = el.getElementsByTagName("input")[0];
     //添加事件
     addEvent(input, "blur", this.blurHandler);
     addEvent(input, "keypress", this.keypressHandler);
    }
   }
  }
 },
 
 
 //产生一个可行解
 cSolution : function() {
  
  var result = [[],[],[],[],[],[],[],[],[],[]];
  var finished = false;
  var constraint = this.validate;
  
  while(!finished) {
   result = [[],[],[],[],[],[],[],[],[],[]];
   backTrack(result, 1);
  }
  
  return result;
  
  function backTrack(result, t) {
   //如果已经完成回溯
   if (finished) return;
   
   //去到尽头
   if ( t > 81 ) {
    finished = true;
    return;
   }
      
   //每个小Table为一个L，总共是1-9个L
   var l = (t == 1) ? 1 :  Math.ceil( t / 9);
   //方格，从1-9
   var d = t % 9;
   var d = (d == 0) ? 9 : d;
   
   //使用随机数，使得每次的出来的初始化的解都不同
   //产生一个0-9之间的数字
   var begin = Math.ceil(Math.random() * 9);
   //查询子树
   for (var i = begin; i <= 9; i++) {
    //如果该解符合条件，则进入
    if (constraint(result, l, d, i)) {
     result[l][d] = i;
     t++;
     backTrack(result, t);
     t--;
    }
   }
   for (i = 1; i < begin; i++) {
    //如果该解符合条件，则进入
    if (constraint(result, l, d, i)) {
     result[l][d] = i;
     t++;
     backTrack(result, t);
     t--;
    }
   }
   
  }
 },
 
 //该格子的值是否符合要求
 validate : function(result, l, d, v) {
  var i , k;
  
  //验证3*3的方格里面是否出现重复数字
  var ll = Math.floor((l - 1) / 3);
  var dd = Math.floor((d - 1) / 3);
  var lBegin = ll * 3 + 1;
  var dBegin = dd * 3 + 1;
  for (i = 0; i < 3; i++) {
   for (k = 0; k < 3; k++) {
    var lc = lBegin + i;
    var dc = dBegin + k;
    if ( lc != l && dc != d && result[lc][dc] == v) return false;
    
   }
  }
   
  //验证同一行上没有重复数字
  for (i = 1; i <= 9; i++) {
   if ( i != d && result[l][i] == v) return false;
  }
  
  //验证同一列上是否有重复数字
  for (i = 1; i <= 9; i++) {
   if ( i != l && result[i][d] == v) return false;
  }
  
  return true;
 },
 
 //随机除去一些结果，得出问题
 cRandomResult : function(result) {
  var level = this.level,
    blank,c;
    
  for (var i = 1; i < 10; i++) {
   blank = level;
   while(blank--) {
    c = Math.ceil(Math.random() * 9);
    if(result[i][c] != '') {
     result[i][c] = '';
    } else {
     blank++;
    }
   }
  }
 },
 
 clickHandler : function(e) {
  e = e || window.event;
  var target = e.target || e.srcElement;
  
  //处理DIV占据TD的空间的情况
  if (target.nodeName == 'DIV') {
   target = target.parentNode;
  }
  
  //判断是否是需要触发事件的元素
  if (target.getAttribute("read") == 'no') {
   var div, input;
   
   div = target.getElementsByTagName("div")[0];
   div.className = "div_no";
   
   input = target.getElementsByTagName("input")[0];
   input.className = "input_yes";
   input.focus();
   
  }
  
 },
 
 //输入值的过滤
 keypressHandler : function(e) {
  e = e || window.event;
  var charCode = getCharCode(e);
  
  if (! /[1-9]/.test(String.fromCharCode(charCode)) && charCode > 9) {
   preventDefault(e);
  }
 },
 
 //失去焦点事件句柄
 blurHandler : function(e) {
  var that = Shudu;
  var nowResult = that.nowResult;
  var failPoint = that.failPoint;
  e = e || window.event;
  var target = e.target || e.srcElement;
  
  //判断是否是需要触发事件的元素
  if (target.getAttribute("text_input") == 1) {
   var v = target.value;
   var td = target.parentNode;
   
   target.className = "input_no";
   var div = td.getElementsByTagName("div")[0];
   div.innerHTML = v;
   div.className = "div_yes";
   
   var row = td.getAttribute("row");
   var col = td.getAttribute("col");
   
   //重新设置值
   nowResult[row][col] = v;
   td.setAttribute("td_value", v);
   
   if ( v != '' && ! that.validate(nowResult, row, col, v)) {
    failPoint[row][col] = true;
    td.className = "td_wrong";
   } else {
    failPoint[row][col] = false;
    td.className = "td_nor";
   }
   
   //更新失败节点的状态
   that.updateFailPoint(row, col);
   
  }
 },
 
 //更新失败点状态
 updateFailPoint : function(row, col) {
  var ceils = this.ceils;
  var failPoint = this.failPoint;
  var nowResult = this.nowResult;
  var i,k,v;
  var validate = this.validate;
  
  //对相关行里面的失败点进行检查
  for (i = 1; i <= 9; i++) {
   if (failPoint[row][i] ) {
    var td = ceils[row][i];
    v = td.getAttribute("td_value");
    
    if (validate(nowResult, row, i, v)) {
     failPoint[row][i] = false;
     td.className = "td_nor";
    }
   }
  }
  
  //对相关列里面的失败点进行检查
  for (i = 1; i <= 9; i++) {
   if (failPoint[i][col]) {
    var td = ceils[row][i];
    v = td.getAttribute("td_value");
    
    if (validate(nowResult, i, col, v)) {
     failPoint[i][col] = false;
     td.className = "td_nor";
    }
   }
  }
  
  //对3*3的范围进行检查
  var ll = Math.floor((row - 1) / 3);
  var dd = Math.floor((col - 1) / 3);
  var lBegin = ll * 3 + 1;
  var dBegin = dd * 3 + 1;
  for (i = 0; i < 3; i++) {
   for (k = 0; k < 3; k++) {
    var lc = lBegin + i;
    var dc = dBegin + k;
    if (failPoint[lc][dc] ) {
     var td = ceils[lc][dc];
     v = td.getAttribute("td_value");
     
     if (validate(nowResult, lc, dc, v)) {
      failPoint[lc][dc] = false;
      td.className = "td_nor";
     }
    }
    
   }
  }
  
 },
 
 //开始计时
 beginTime : function() {
  var doc = document;
  var usetime = doc.getElementById("usetime");
  var beginTime = new Date();
  //获取时间
  var bH = beginTime.getHours();
  var bM = beginTime.getMinutes();
  var bS = beginTime.getSeconds();
  
  //不断计算用时
  Shudu.timeObj.sign = setTimeout(function(){
    //设置时间
    var now = new Date();
    var nH = now.getHours();
    var nM = now.getMinutes();
    var nS = now.getSeconds();
    
    if (nS < bS) {
     nM --;
     nS += 60;
    }
    if (nM < bM) {
     nH--;
     nM += 60;
    }
    
    var s = nS - bS;
    var m = nM - bM;
    var h = nH - bH;
    
    var timeObj = Shudu.timeObj;
    timeObj.h = h;
    timeObj.m = m;
    timeObj.s = s;
    
    usetime.value = h + ":" + m + ":" + s;
    
    //自身调用
    timeObj.sign = setTimeout(arguments.callee, 1000)
   }, 1000);
 },
 
 //结束计时
 endTime : function() {
  var sign = this.timeObj.sign;
  if (sign != null) clearTimeout(sign);
 },
 
 //完成问题的检查
 finishCheck : function() {
  if (this.isFinished()) {
   //结束计时
   this.endTime();
   
   //设置按钮和显示提示信息
   var doc = document;
   var timeObj = this.timeObj;
   doc.getElementById("begin").value = "  开始  ";
   doc.getElementById("finish").disabled = "disabled";
   doc.getElementById("usetime").value = "0:0:0";
   alert("=_= 恭喜你完成了游戏，你的用时是" + timeObj.h + ":" + timeObj.m + ":" + timeObj.s);
   
  } else {
   alert("+_+ 你还没完成！");
  }
 },
 
 //确定是否解决问题
 isFinished : function() {
  var nowResult = this.nowResult;
  var failPoint = this.failPoint;
  var i,k;
  
  //检查是否完成
  for (i = 1; i <= 9; i++) {
   for (k = 1; k <= 9; k++) {
    if (nowResult[i][k] == "" || failPoint[i][k] ) {
     return false;
    }
   }
  }
  
  return true;
 }
 
 
};

//添加事件兼容处理
function addEvent(target, type, handler) {
 if (window.addEventListener) {
  addEvent = function(target, type, handler) {
   target.addEventListener(type, handler, false);
  }
 } else {
  addEvent = function(target, type, handler) {
   target.attachEvent("on" + type, handler);
  }
 }
 addEvent(target, type, handler);
}

//删除事件兼容处理
function removeEvent(target, type, handler) {
 if (window.removeEventListener) {
  removeEvent = function(target, type, handler) {
   target.removeEventListener(type, handler, false);
  }
 } else {
  removeEvent = function(target, type, handler) {
   target.detachEvent("on" + type, handler);
  }
 }
 removeEvent(target, type, handler);
}

//阻止冒泡兼容处理
function stopPropagation(e) {
 if (e.stopPropagation) {
  stopPropagation = function(e) {
   e.stopPropagation();
  }
 } else {
  stopPropagation = function(e) {
   e.cancelBubble = true;
  }
 }
 stopPropagation(e);
}

//阻止默认动作兼容处理
function preventDefault(e) {
 if (e.preventDefault) {
  preventDefault  = function(e) {
   e.preventDefault();
  }
 } else {
  preventDefault = function(e) {
   e.returnValue = false;
  }
 }
 preventDefault(e);
}

//获取字符编码
function getCharCode(e) {
 if (typeof e.charCode == 'number') {
  return e.charCode;
 } else {
  return e.keyCode
 }
}

//开始跑句柄
function shuDuRun() {
 //更新按钮信息
 var finish = document.getElementById("finish");
 var begin = document.getElementById("begin");
 begin.value = "  重新开始  ";
 finish.disabled = "";
 //运行数独
 Shudu.run();
}

//完成句柄
function shuDuFinish() {
 Shudu.finishCheck();
}

//初始化句柄
function loadRun() {
 //初始化数独
 Shudu.init();
 
 var begin = document.getElementById("begin");
 var finish = document.getElementById("finish");
 //添加点击事件
 addEvent(finish, "click", shuDuFinish);
 addEvent(begin, 'click', shuDuRun);
}

//添加加载事件
addEvent(window, "load", loadRun);