class KIM_Tools{
	static slice_by_daterange(data,DTrange){
    	var startDT = DTrange[0], endDT=DTrange[DTrange.length-1];
	    return data.filter(d => (d.date >= startDT) & (d.date <= endDT));		
	}

	static slice_by_key_and_daterange(data,index,DTrange){
    	var startDT = DTrange[0], endDT=DTrange[DTrange.length-1];
	    return data
	    	.filter(d => (d.date >= startDT) & (d.date <= endDT))
	    	.map(function(d){return d[index]});		
	}

	static getYDomain_type_ochl(data,DTrange){
		return techan.scale.plot.ohlc(
			KIM_Tools.slice_by_daterange(data,DTrange),
			techan.plot.candlestick().accessor()
		).domain();		
	}
	static MA(width,srcdata,iname){
		var data = [],
			subsum=0,
			subsumA=1,
			k = Math.exp(Math.log(0.1)/width),
			inamePlus = iname + "_" + width;
		srcdata.forEach(	
			function(d,i){
				var dd = d[iname];
				if(d[iname]>0) {
					subsum = subsum*k + dd;
					subsumA = subsumA*k + 1;
					d[inamePlus] = subsum/subsumA;
				}
			}
		);
	}

	static getWindowWH(){
		return {
			width: window.innerWidth,
			height:window.innerHeight
		}	
	}

	static Float32Concat(first, second){
	    var firstLength = first.length,
	        result = new Float32Array(firstLength + second.length);

	    result.set(first);
	    result.set(second, firstLength);
	    return result;
	}
	static Merge2glBuffer(A,B){
		var result = {};
		A.plusItems.forEach(item=>{
			result[item] = A[item] + B[item];
		});
		A.mergeItems.forEach(item=>{
			result[item] = KIM_Tools.Float32Concat(A[item] , B[item]);
		});		
		return result;		
	}
	static Clone(A){
		return $.extend(true,{},A);
	}	
	static getYticks_10(d){
		let re=[];
		for (var i=Math.ceil(Math.floor(d[0])/10);i<=Math.floor(Math.ceil(d[1])/10);i++){
			re.push(i*10);
		}
		return re;	    	
    }


}

class KIMLIB_gridLayout{
	constructor(x,y,w,h){
		this.Element_xywh = [];
	}
	set_Element_minWH(w,h){
		this.Element_minWidth = w;
		this.Element_minHeight = h;
	}
	set_xy(x,y){
		this.x = x;
		this.y = y;		
	}
	set_WH(w,h){
		this.width = w;
		this.height = h;		
	}
	set_Element_count(count){
		this.Element_count = count;
	}
	Layout_columes_count(cc){
		if (this.width/cc < this.Element_minWidth) {
			return false;
		}
		this.Element_Width = this.width/cc - 5;
		let gap_width = this.width / cc;
		let gap_height = this.Element_minHeight + 5;

		for(var i=0;i<this.Element_count;i++){
			var cr = KIMLIB_gridLayout.tool_col_row(cc,i);
			this.Element_xywh.push(
				{	
					x: this.x + cr.col * gap_width, 
					y: this.y + cr.row * gap_height, 
					w: this.Element_Width,
					h: this.Element_minHeight
				}
			);
		}

	}

	static tool_col_row(cc,i){
		var col = i % cc;
		var row = Math.floor(i/cc);
		return {
			col: col,
			row: row
		}
	}
	static set_absolute_xywh(ele,xywh){
        ele.style.position = "absolute";		
        ele.width = xywh.w;
        ele.height = xywh.h;
        ele.style.top = xywh.y + "px";
        ele.style.left = xywh.x + "px";
	}
}