// Define Stock
	class Stock{
		static getStockPaser(datePaser){
			return function(d){
				  return {
				    date: datePaser(d.DATE),
				    open:     +d.OPEN,
				    high:     +d.HIGH,
				    low:      +d.LOW,
				    close:    +d.CLOSE,
				    volume:   +d.VOLUME,
				    amount:   +d.AMOUNT,
				    AVP15: 	  +d.AVP15,
				    AVP30: 	  +d.AVP30,
				    AVP60: 	  +d.AVP60,
				    AVP120:   +d.AVP120,
				    AVP240:	  +d.AVP240,
				    SHC15: 	  +d.SHC15,
				    SHC30: 	  +d.SHC30,
				    SHC60: 	  +d.SHC60,
				    SHC120:   +d.SHC120,
				    SHC240:	  +d.SHC240,
	    			MODEL1:   +d.MODEL1, 
	    			ZJM5: 	  +d.ZJM5, 
				  }
			}
		};
		static getZJM5Paser(datePaser){
			return function(d){
				  return {
				    date:     datePaser(d.DATE),
	    			ZJM5: 	  +d.ZJM5, 
				  }
			}
		};
		static getModelPaser(datePaser){
			return function(d){
				  return {
				    date:     datePaser(d.DATE),
	    			MODEL1: 	  +d.MODEL1, 
				  }
			}
		};

		constructor(ide) {
			this.IDE = ide;
			this.csvURL_DK = "../B001/DK/DK_" + this.IDE + ".csv";
			this.csvURL_M5 = "../B001/M5/M5_" + this.IDE + ".csv";
			this.csvURL_ZJM5 = "../B001/ZJM5/ZJM5_" + this.IDE + ".csv";
			this.csvURL_est = "../B001/FACTOR/EST/est" + this.IDE + ".csv";
			this.csvURL_MODEL = "../B001/MODEL/M5_Model_" + this.IDE + ".csv";


		}
		load_DK(){
			var t = this;
			var Parser = d3.timeParse("%Y-%m-%d"),limitdate = Parser("2019-12-19");
			console.log("limitdate",limitdate);
			this.DK = d3.csvParse($.ajax({ async: false, url: t.csvURL_DK}).responseText)
				.map(Stock.getStockPaser(d3.timeParse("%Y-%m-%d")))
				// .filter(function(d){return d.date<limitdate})
			;
			this.DK_initendi = this.DK.length-1;
		}
		load_M5(){
			var t = this;
			var Parser = d3.timeParse("%Y-%m-%d"),limitdate = Parser("2019-12-19");
			this.M5 = d3.csvParse($.ajax({ async: false, url: t.csvURL_M5}).responseText)
				.map(Stock.getStockPaser(d3.timeParse("%Y-%m-%d %H:%M:%S")))
				// .filter(function(d){return d.date<limitdate})
			;
			this.M5_initendi = this.M5.length-1;
			// this.load_MODEL();
		}
		load_MODEL(){
			var t = this;
			var Parser = d3.timeParse("%Y-%m-%d"),limitdate = Parser("2019-12-19");
			let model = d3.csvParse($.ajax({ async: false, url: t.csvURL_MODEL}).responseText)
				.map(Stock.getModelPaser(d3.timeParse("%Y-%m-%d %H:%M:%S")))
				// .filter(function(d){return d.date < limitdate})
				.sort((a,b)=>{	return d3.ascending(a.date, b.date) });

			let ids = ["MODEL1"];
			this.M5.forEach((d,i)=>{ ids.forEach(id=>{ d[id] = model[i][id] }) });	
		}		
		load_ZJM5(){
			var t = this;
			this.ZJM5 = d3.csvParse(
					$.ajax({ async: false, url: t.csvURL_ZJM5}).responseText
				)
			.map(
				Stock.getZJM5Paser(d3.timeParse("%Y-%m-%d %H:%M:%S"))
			);
			var cumsum=0;
			var t = this;
			this.ZJM5
				.forEach(
					function(d,index){
						cumsum = cumsum + d.ZJM5;
						d.ZJM5 = cumsum;					
					}
			);
		}
		load_All(){
	        this.load_DK();
	        this.load_M5();
	        this.load_ZJM5();
		}

		load_TDY(nTDY){
			var t = this;
			this.DK_TDY = [this.DK[this.DK_initendi],...nTDY.DK.filter(d=>{return d.IDE == t.IDE})];
			this.DK = this.DK.filter((d,i)=>{return i < t.DK_initendi});
			this.DK.push(...this.DK_TDY);

			this.M5_TDY = [this.M5[this.M5_initendi],...nTDY.M5.filter(d=>{return d.IDE == t.IDE})];
			this.M5 = this.M5.filter((d,i)=>{return i < t.M5_initendi});
			this.M5.push(...this.M5_TDY);


		}
		load_estPrams(){
			var t = this;
			this.estParams = d3.csvParse($.ajax({ async: false, url: t.csvURL_est}).responseText)
				.map(KIMLIB_Factor.getFactorPaser(d3.timeParse("%Y-%m-%d")));
			console.log(this.estParams);
			this.estParams = this.estParams[0];
		}
	}

// Define SH_DTs
	class SH_DTs{
		constructor() {
			this.csvURL_DK = "../shdts.csv";
			this.csvURL_M5 = "../shdthms.csv";

			var DKPaser = d3.timeParse("%Y-%m-%d"),
				M5Paser = d3.timeParse("%Y-%m-%d %H:%M:%S");

			var t = this;	
			this.DK = d3.csvParse($.ajax({ async: false, url: t.csvURL_DK}).responseText)
				.map( function(d){return DKPaser(d.DT)});
					
			this.M5 = d3.csvParse($.ajax({ async: false, url: t.csvURL_M5}).responseText)
				.map( function(d){return M5Paser(d.DTHM)});
		}	
	}

// Define KIMLIB_Factor
	class KIMLIB_Factor{
		static getFactorPaser(datePaser){
			return function(d){
				  return {
				    date: datePaser(d.DATE),
				    r:    +d.R, 
				    f1:       +d.F1 ,
				    f2:       +d.F2,
				    f3:       +d.F3,
				    f4:       +d.F4,
				    f5:       +d.F5,
				    f6:       +d.F6,
				    f7:       +d.F7,
				    f8:       +d.F8,
				    f9:       +d.F9,
				    f10:      +d.F10,
				    f11:       +d.F11 ,
				    f12:       +d.F12,
				    f13:       +d.F13,
				    f14:       +d.F14,
				    f15:       +d.F15,
				    f16:       +d.F16,
				    f17:       +d.F17,
				    f18:       +d.F18,
				    f19:       +d.F19,
				    f20:      +d.F20,
				    f21:       +d.F21 ,
				    f22:       +d.F22,
				    f23:       +d.F23,
				    f24:       +d.F24,
				    f25:       +d.F25,
				    f26:       +d.F26,
				    f27:       +d.F27,
				    f28:       +d.F28,
				    f29:       +d.F29,
				    f30:       +d.F30,

				    f31:       +d.F31 ,
				    f32:       +d.F32,
				    f33:       +d.F33,
				    f34:       +d.F34,
				    f35:       +d.F35,
				    f36:       +d.F36,
				    f37:       +d.F37,
				    f38:       +d.F38,
				    f39:       +d.F39,

				    f40:       +d.F40,
				    f41:       +d.F41 ,
				    f42:       +d.F42,
				    f43:       +d.F43,
				    f44:       +d.F44,
				    f45:       +d.F45,
				    f46:       +d.F46,
				    f47:       +d.F47,
				    f48:       +d.F48,
				    f49:       +d.F49,

				    f50:       +d.F50,
				    f51:       +d.F51 ,
				    f52:       +d.F52,
				    f53:       +d.F53,
				    f54:       +d.F54,
				    f55:       +d.F55,
				    f56:       +d.F56,
				    f57:       +d.F57,
				    f58:       +d.F58,
				    f59:       +d.F59,

				    f60:       +d.F60,
				    f61:       +d.F61 ,
				    f62:       +d.F62,
				    f63:       +d.F63,
				    f64:       +d.F64,
				    f65:       +d.F65,
				    f66:       +d.F66,
				    f67:       +d.F67,
				    f68:       +d.F68,
				    f69:       +d.F69,

				    f70:       +d.F70,
				    f71:       +d.F71 ,
				    f72:       +d.F72,
				    f73:       +d.F73,
				    f74:       +d.F74,
				    f75:       +d.F75,
				    f76:       +d.F76,
				    f77:       +d.F77,
				    f78:       +d.F78,
				    f79:       +d.F79,

				    f80:       +d.F80,
				    f81:       +d.F81 ,
				    f82:       +d.F82,
				    f83:       +d.F83,
				    f84:       +d.F84,
				    f85:       +d.F85,
				    f86:       +d.F86,
				    f87:       +d.F87,
				    f88:       +d.F88,
				    f89:       +d.F89,

				    f90:       +d.F90,
				    f91:       +d.F91 ,
				    f92:       +d.F92,
				    f93:       +d.F93,
				    f94:       +d.F94,
				    f95:       +d.F95,
				    f96:       +d.F96,
				    f97:       +d.F97,
				    f98:       +d.F98,
				    f99:       +d.F99,

				    f100:       +d.F100,
				  }
			}
		};
		constructor() {
			this.csvURL_DK = "../B001/FACTOR/DK/FACTOR_DK.csv";
			var t = this;
			this.DK = d3.csvParse($.ajax({ async: false, url: t.csvURL_DK}).responseText)
			.map(KIMLIB_Factor.getFactorPaser(d3.timeParse("%Y-%m-%d")))
			.sort((a,b)=>{return d3.ascending(a.date, b.date)});
		}
	}


// Define KIMLIB_Index
	class KIMLIB_Index{
		static getIndexPaser(datePaser,cname){
			return function(d){
				    let rd = {};
				    rd.date = datePaser(d.DT);
					for(let i=0;i<cname.count;i++) {
					    rd["f"+(i+1)] = +d[cname.in[i+1]];
					}
				  return rd;
			}
		};
		static getSordtedNames(d){

		    let convert = {};
		    let inames = Object.keys(d);
		    let count = 0;
			for(let i=2;i<inames.length;i++) {
				count++;
			    convert[count] = inames[i];
			}
			return 	{
				in: 	convert,
				count: 	count
			};		

		}
		constructor() {
			this.csvURL_DK = "../B001/INDEX/Index_DK.csv";
			var t = this;
			this.DK = d3.csvParse($.ajax({ async: false, url: t.csvURL_DK}).responseText);
			this.sortedIndex = KIMLIB_Index.getSordtedNames(this.DK[0]);
			this.DK = this.DK.map(KIMLIB_Index.getIndexPaser(
				d3.timeParse("%Y-%m-%d"),
				this.sortedIndex)
			);

		}
	}