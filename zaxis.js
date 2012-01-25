/**
*	lookee here: http://membres.multimania.fr/amycoders/tutorials/3dbasics.html
*	and here: http://en.wikipedia.org/wiki/3D_projection#Perspective_projection
*/
var Vector = function(x, y, z) {
	this.x = x;
	this.y = y;
	this.z = z;
};
Vector.prototype.subtract = function(v) {
	this.x -= v.x;
	this.y -= v.y;
	this.z -= v.z;
	return this;
};


function ZAxis(canvas) {
	this.canvas = canvas;
	this.ctx = this.canvas.getContext('2d');
	
	this.buffer = document.createElement('canvas');
	this.buffer.width = this.canvas.width;
	this.buffer.height = this.canvas.height;
	this.bufferCtx = this.buffer.getContext('2d');
	
	this.mouseX = 0;
	this.mouseY = 0;
	
	var that = this,
		alpha = 1;
	
	this.perspective = 800;
	
	var increment = 0.01;
	
	this.translate = new Vector(0, 0, 0);
	
	// The 'z'/Projection plane
	// u,v,w
	this.projectionPlane = new Vector(this.canvas.width/2, this.canvas.height/2, this.perspective);
	
	this.objects = [];
	
	this.pressedKeys = {};
	
	this.keyHandler = function(key) {
		key = String.fromCharCode(key.keyCode).toLowerCase();
		
		if(key === 'w') {
			that.projectionPlane.y -= 1;
		}
		else if(key === 's') {
			that.projectionPlane.y += 1;
		}
	};
	
	this.onkeydown = function(key) {
		key = String.fromCharCode(key.keyCode).toLowerCase();
		that.pressedKeys[key] = true;
	};
	
	this.onkeyup = function(key) {
		key = String.fromCharCode(key.keyCode).toLowerCase();
		that.pressedKeys[key] = false;
	};
	
	this.onmousemove = function(e) {
		that.mouseX = (e.pageX - (window.innerWidth/2))/100;
		that.mouseY = (e.pageY - (window.innerHeight/2))/100;
	};
	
	this.onmousewheel = function(e){
		that.perspective += e.wheelDeltaY / 5;
		
		// if(that.perspective < 1) that.perspective = 1;
		
		that.projectionPlane.z = that.perspective;
	};
	
	document.body.onkeydown = this.onkeydown;
	document.body.onkeyup = this.onkeyup;
	document.body.onmousemove = this.onmousemove;
	document.body.onmousewheel = this.onmousewheel;
	
	this.makeCube = function(x, y, z, w, h, d) {
		this.objects.push({
			type: 'line',
			pos: new Vector(x, y, z),
			width: w,
			height: h,
			depth: d,
			faces: [
				// back
				{
					name: 'back',
					points: [
						new Vector(x, y, z + d),
						new Vector(x + w, y, z + d),
						new Vector(x + w, y + h, z + d),
						new Vector(x, y + h, z + d),
					],
					points2d: [],
					color: 'rgba(255,255,0,' + alpha + ')'
				},
				
				// top
				{
					name: 'top',
					points: [
						new Vector(x, y, z),
						new Vector(x+w, y, z),
						new Vector(x+w, y, z+d),
						new Vector(x, y, z+d),
					],
					points2d: [],
					color: 'rgba(255,0,0,' + alpha + ')'
				},
				
				// bottom
				{
					name: 'bottom',
					points: [
						new Vector(x, y+h, z),
						new Vector(x+w, y+h, z),
						new Vector(x+w, y+h, z+d),
						new Vector(x, y+h, z+d),
					],
					points2d: [],
					color: 'rgba(0,255,0,' + alpha + ')'
				},
				
				// left
				{
					name: 'left',
					points: [
						new Vector(x, y, z),
						new Vector(x, y, z+d),
						new Vector(x, y+h, z+d),
						new Vector(x, y+h, z),
					],
					points2d: [],
					color: 'rgba(0,0,255,' + alpha + ')'
				},
				
				// right 
				{
					name: 'right',
					points: [
						new Vector(x+w, y, z),
						new Vector(x+w, y, z+d),
						new Vector(x+w, y+h, z+d),
						new Vector(x+w, y+h, z),
					],
					points2d: [],
					color: 'rgba(0,255,255,' + alpha + ')'
				},
				
				// front
				{
					name: 'front',
					points: [
						new Vector(x, y, z),
						new Vector(x + w, y, z),
						new Vector(x + w, y + h, z),
						new Vector(x, y + h, z),
					],
					points2d: [],
					color: 'rgba(0,0,0,' + alpha + ')'
				},
			]
		})
	}
	
	
	this.initialize = function() {
		var points = [];
		
		for(var i = 0; i < 500; ++i) {
			this.makeCube(
				Math.floor(Math.random() * this.canvas.width),
				Math.floor(Math.random() * this.canvas.height),
				256,
				5,
				5,
				256
			);
		}
		
		this.sortObjects();
		
	};
	
	this.sortObjects = function() {
		
		var centerX = window.innerWidth / 2,
			centerY = window.innerHeight / 2;
		
		that.objects.sort(function(a, b) {
			if(!a.faces[5].points2d.length) return;
			var ax = a.faces[5].points2d[0].x,
				ay = a.faces[5].points2d[0].y,
				bx = b.faces[5].points2d[0].x,
				by = b.faces[5].points2d[0].y;
				
			ax = Math.abs(ax - centerX);
			ay = Math.abs(ay - centerY);
			bx = Math.abs(bx - centerX);
			by = Math.abs(by - centerY);
			
			var hypA = ax * ax + ay * ay,
				hypB = bx * bx + by * by;
				
			return hypB - hypA;			
		});
		
	};

	
	this.update = function(obj) {
		this.updateLine(obj);
	};
	
	
	
	this.updateLine = function(obj) {
		
		// Clip the cube if it's offscreen
		if( obj.x < 0 || obj.x > this.canvas.width || obj.y < 0 || obj.x > this.canvas.height) return;
		
		var currentFace, j, numFaces, 
			i, numPoints, rand = (Math.random() * 20) - 10,		
			numFaces = obj.faces.length;

		var a,
			p = this.projectionPlane;
			
		for(j = 0; j < numFaces; ++j) {
			
			currentFace = obj.faces[j];
			numPoints = currentFace.points.length;
			
			for(i = 0; i < numPoints; ++i) {
				
				// Create a place to store the 2d points of vector a.
				if(!currentFace.points2d[i]) {
					currentFace.points2d[i] = {};
				}
				
				// Cache the Vector for the current point.
				a = currentFace.points[i];
				
				// Calculate mouse movement (taking into account the canvas translation value)
				if(that.mouseX && that.mouseY) {
					p.y = (that.mouseY * 100) + (that.canvas.height/2) - that.translate.y;
					p.x = (that.mouseX * 100) + (that.canvas.width/2) - that.translate.x;
				}
				
				// Make the calculation
				currentFace.points2d[i].x = ((p.z * (a.x - p.x)) / (a.z + p.z)) + a.x;
				currentFace.points2d[i].y = ((p.z * (a.y - p.y)) / (a.z + p.z)) + a.y;
			}
		}
	};
	
	this.draw = function(obj) {
		
		if(this.pressedKeys['w']) {
			this.translate.y -= increment;
		}
		if(this.pressedKeys['s']) {
			this.translate.y += increment;
		}
		if(this.pressedKeys['a']) {
			this.translate.x -= increment;
		}
		if(this.pressedKeys['d']) {
			this.translate.x += increment;
		}
		
		this.drawLine(obj);
	};
	
	this.isVisibleBetween = function (a, b, c) {
		if (((b.y-a.y)/(b.x-a.x)-(c.y-a.y)/(c.x-a.x)<0) ^ (a.x<=b.x == a.x>c.x)) {
			return true;
		} else {
			return false;
		}
	};
	
	
	this.drawLine = function(obj) {
		
		var currentFace, j, numFaces, 
			i, numPoints, currentPoints;
		
		numFaces = obj.faces.length;
		
		for(j = 0; j < numFaces; ++j) {
			
			currentFace = obj.faces[j];
			numPoints = currentFace.points.length;
			currentPoints = currentFace.points2d;
			
			this.ctx.beginPath();
			this.ctx.moveTo(currentPoints[0].x, currentPoints[0].y);
			
			
			if(
				(currentFace.name === 'right' && this.isVisibleBetween(currentPoints[0], currentPoints[1], currentPoints[2]))||
				(currentFace.name === 'left' && !this.isVisibleBetween(currentPoints[0], currentPoints[1], currentPoints[2])) ||
				(currentFace.name === 'top' && !this.isVisibleBetween(currentPoints[0], currentPoints[1], currentPoints[2])) ||
				(currentFace.name === 'bottom' && this.isVisibleBetween(currentPoints[0], currentPoints[1], currentPoints[2])) ||
				currentFace.name === 'front'
			) {
				for(i = 0; i < numPoints; ++i) {
					this.ctx.lineTo(currentPoints[i].x, currentPoints[i].y);
				}
			}
			
			this.ctx.closePath();
			//this.ctx.stroke();
			
			if(currentFace.color) {
				this.ctx.fillStyle = currentFace.color
				this.ctx.fill();
			}
		}
	};
	
	this.clearCanvas = function() {
		that.ctx.fillStyle = 'rgba(255,255,255,1)';
		that.ctx.fillRect(0, 0, that.canvas.width, that.canvas.height);
	};
	
	this.render = function() {
		
		var currentObj;
		
		window.webkitRequestAnimationFrame(that.render);
		
		
		
		that.clearCanvas();
		
		that.ctx.save();
		that.ctx.translate(that.translate.x, that.translate.y);
		
		for(var i = 0, l = that.objects.length; i < l; ++i) {
			
			currentObj = that.objects[i];
			
			that.update(currentObj);
			
			that.draw(currentObj);
			// that.ctx.fillStyle = '#fff';
			// that.ctx.fillText(i, currentObj.faces[4].points2d[0].x -25, currentObj.faces[4].points2d[0].y + 13);
		}
		
		that.sortObjects();
		
		that.ctx.restore();
	};

}


function load() {
	var a = new ZAxis(document.getElementById('canvas'));
	a.initialize();
	a.render();
}

window.addEventListener('load', load, false);