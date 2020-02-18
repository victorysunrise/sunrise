
// used classes in SVG_lib.js

class AVPSHC{
    constructor(motherDOM,width,height,stock) {
    	this.class = "AVPSHC";
        this.motherDOM = motherDOM; 
        this.stock = stock;	this.width = width;	this.height = height;  
  		this.DOM = this.motherDOM.append("g").attr("class",this.class);


		var t = this;
		this.zoomrect = this.DOM.append("rect")
			.attr("width", this.width)
			.attr("height", this.height)
			.style("fill", "none")
			.style("pointer-events", "all");
		this.zoomrectCreator = 
			d3.zoom()
			    .scaleExtent([0.1, 500])
			    .extent([[0, 0], [t.width, t.height]])
			    .on("zoom", function () {
			    	t.zoomtransform = d3.event.transform;
			    	t.Draw();
				});	
		this.zoomrect.call(this.zoomrectCreator);	


		this.xScale = d3.scaleLinear().range([0,width]);
		this.yScale = d3.scaleLinear().range([height,0]);


		const Mid = arr => (arr[0]+arr[1])/2,
			  DIf = arr => (arr[1]-arr[0])/2,
			  getY = function(half_x,mid,ratio){
			  	return [mid-half_x*ratio,mid+half_x*ratio];
			  };


		var minmaxY = d3.extent(this.stock.DK.map(function(d){return d.AVP15})),
			minmaxX = d3.extent(this.stock.DK.map(function(d){return d.SHC15})),
			midpoint = [Mid(minmaxX),Mid(minmaxY)],
			d = [DIf(minmaxX),DIf(minmaxY)],
			ratio_view = -DIf(this.yScale.range())/DIf(this.xScale.range());

		if (ratio_view <  d[1]/d[0]){
			this.yScale.domain(minmaxY);
			this.xScale.domain(getY(d[1],midpoint[0],1/ratio_view));
		}
		else{
			this.yScale.domain(getY(d[0],midpoint[1],ratio_view));
			this.xScale.domain(minmaxX);
		}


   

		this.Draw_grid();
		this.linelist=[];		
    }


    Draw_grid(){
    	if (!("grid_x_DOM" in this)){
			this.grid_x_DOM	 = this.DOM
				.append("g")
				.attr("class","grid x")
				.attr("transform","translate(0," + this.height + ")")
				.style("stroke-dasharray",("1,1"));
    	}
		this.grid_x_DOM.call(d3.axisBottom(this.xScale)
			.tickValues(getarrayby10(this.xScale.domain()))
			.tickSize(-this.height).tickFormat("")
		);



    	if (!("grid_y_DOM" in this)){
 			this.grid_y_DOM	 = this.DOM
 				.append("g")
 				.attr("class","grid y")
 				.style("stroke-dasharray",("1,1"));
    	}
		this.grid_y_DOM.call(d3.axisLeft(this.yScale)
   			.tickValues(getarrayby10(this.yScale.domain()))
   			.tickSize(-this.width).tickFormat("")
		);

    }

    Draw(){
		var zoomed_xScale = this.zoomtransform.rescaleX(this.xScale);
		var zoomed_yScale = this.zoomtransform.rescaleY(this.yScale);
    	if ("grid_x_DOM" in this){
			this.grid_x_DOM.call(d3.axisBottom(zoomed_xScale)
				.tickValues(getarrayby10(zoomed_xScale.domain()))
				.tickSize(-this.height).tickFormat("")
			);
    	}
    	if ("grid_y_DOM" in this){
			this.grid_y_DOM.call(d3.axisLeft(zoomed_yScale)
	   			.tickValues(getarrayby10(zoomed_yScale.domain()))
	   			.tickSize(-this.width).tickFormat("")
			);
    	}

	    for (var i of this.linelist){
	    	var dd = i.datum();
			i.datum(dd).attr("d", d3.line()
		        .x(function(d) { return zoomed_xScale(d.x) })
		        .y(function(d) { return zoomed_yScale(d.y) })
	    	); 
	    }
   }

   add_xyline(x_,y_,cls){
   		var No = this.DOM.selectAll(".line")._groups[0].length;

		this[cls+"_DOM"] = this.DOM.append("g").attr("class", "line").attr("id","L"+No).attr("opacity",1);

		var dd = this.stock.DK.map(function(e){ return { date:e.date,  x: e[x_],	y: e[y_],};});
		var tdd = getToMak(dd);

		var t = this;
		var odd = 0;
		for (var tomak of tdd){
			if (odd==0){odd = 1}else{odd=0}

			var aa = this[cls+"_DOM"].append("path").attr("class", cls+" hot"+odd)
				.datum(tomak)
			    .attr("d", d3.line()
			        .x(function(d) { return t.xScale(d.x)  })
			        .y(function(d) { return t.yScale(d.y)  })
		    ); 
			this.linelist.push(aa);
		}

		function getToMak(arr){
			var ToMaklist=[];
			var lastyear=-1, nowarr;
			for (var d of arr){
				if(lastyear != d.date.getMonth()){
					lastyear = d.date.getMonth();
					if (typeof(nowarr) != 'undefined' ) nowarr.push(d);
					ToMaklist.push([]);
					nowarr = ToMaklist[ToMaklist.length-1]; 
				}
				nowarr.push(d);
			}
			return ToMaklist;
		}

		console.log(a);

		this.DOM
			.append("g")
				.attr("class","legend "+cls)
				.attr("id",No)
			.append("circle")
				.attr("cx",10)
				.attr("cy",10 + 20*No)
				.attr("r",7)
			.on("click",function(d){
				if ($(this).css("opacity") == 1){

					d3.select(this)
					.transition().duration(500)
						.style("opacity",.5);

					t[cls+"_DOM"]
					.transition().duration(500) 
						.style("opacity",0);



				}
				else{
					d3.select(this)
					.transition()
						.duration(500)
						.style("opacity",1);

					t[cls+"_DOM"]
					.transition().duration(500) 
						.style("opacity",1);
												
				}
				
			});




   }

}
