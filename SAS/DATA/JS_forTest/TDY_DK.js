// class TDY_DK{
// 	static getTDYPaser(datePaser){
// 		return function(d){
// 			  return {
// 			  	IDE: 	  d.IDE,
// 			    date:     datePaser(d.DATE),
// 			    open:     +d.OPEN,
// 			    high:     +d.HIGH,
// 			    low:      +d.LOW,
// 			    close:    +d.CLOSE,
// 			    volume:   +d.VOLUME,
// 			    amount:   +d.AMOUNT,
// 			    AVP15: 	  +d.AVP15,
// 			    AVP30: 	  +d.AVP30,
// 			    AVP60: 	  +d.AVP60,
// 			    AVP120:   +d.AVP120,
// 			    AVP240:	  +d.AVP240,
// 			    SHC15: 	  +d.SHC15,
// 			    SHC30: 	  +d.SHC30,
// 			    SHC60: 	  +d.SHC60,
// 			    SHC120:   +d.SHC120,
// 			    SHC240:	  +d.SHC240,
//     			MODEL1:   +d.MODEL1, 
//     			ZJM5: 	  +d.ZJM5, 			    
// 			  }
// 		}
// 	};	
// 	constructor(){
// 		this.csvURL_DK = "../B001/TDY/DK.csv";
// 		this.csvURL_M5 = "../B001/TDY/M5.csv";

// 	}
// 	update(){
// 		var t = this;
// 		this.DK = d3.csvParse($.ajax({ async: false, url: t.csvURL_DK}).responseText)
// 			.map(TDY_DK.getTDYPaser(d3.timeParse("%Y-%m-%d")));
// 		this.M5 = d3.csvParse($.ajax({ async: false, url: t.csvURL_M5}).responseText)
// 			.map(TDY_DK.getTDYPaser(d3.timeParse("%Y-%m-%d %H:%M:%S")));

// 		console.log("data update finished !");
// 	}

// 	resize(x,y,w,h){
// 		this.x = x;
// 		this.y = y;
// 		this.width = w;	
// 		this.height = h;
// 		this.canvas.width = this.width;
// 		this.canvas.height = this.height;
// 		this.canvas.style.top = this.y + "px";
// 		this.canvas.style.left = this.x + "px";
// 	}
// }

