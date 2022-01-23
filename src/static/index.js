//Author: xmacho12

// Get the canvas element form the page
let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');

let refresh = 0

Number.prototype.clamp = function(min, max) {
    return Math.min(Math.max(this, min), max);
};

let robot = {
    motorSpeeds: [0, 0, 0, 0],
    sensors: [
        {key: 0, type: 'color', port: 'A', value: [0,0,0], unit: ''},
        {key: 1, type: 'touch', port: 'B', value: 0, unit: ''},
        {key: 2, type: 'gyro', port: 'C', value: [0,0,0], unit: 'm/s²'},
        {key: 3, type: 'ultrasonic', port: 'D', value: 0, unit: 'cm'},
    ],

    size: [100,150],
    wheelDistance: 120,
    wheelCoef: 100,

    position: [300,300],
    angle: 0,
    lastTime: 0,

    draw(ctx) {
        ctx.translate(this.position[0] + this.size[0]/2, this.position[1] + this.size[0]/2);
        ctx.rotate(this.angle);

        ctx.fillRect(-this.size[0]/2, -this.size[1]/2, this.size[0], this.size[1]);
        ctx.fillStyle = 'yellow';
        ctx.fillRect(-this.size[0]/2, this.size[1]/2, this.size[0], 10);
        ctx.fillStyle = 'red';
        ctx.fillRect(-this.size[0]/2, -this.size[1]/2-10, this.size[0], 10);

        this.updatePosition()
    },

    updatePosition() {
        currentTime = performance.now()/1000;

        // for the first update ever
        if (this.lastTime == 0) {
            this.lastTime = currentTime;
            return;
        }

        dt = currentTime - this.lastTime;
        this.lastTime = currentTime;

        // rw means right wheel
        rwRelPos = [
            this.wheelDistance/2,
            this.motorSpeeds[1] * this.wheelCoef * dt,
        ];

        lwRelPos = [
            -this.wheelDistance/2,
            this.motorSpeeds[0] * this.wheelCoef * dt,
        ];

        if (refresh++ % 120 == 0) {
            console.log(lwRelPos);
            console.log(rwRelPos);
        }

        deltaPos = [
            (rwRelPos[0] + lwRelPos[0]) / 2,
            (rwRelPos[1] + lwRelPos[1]) / 2,
        ];

        // angle transformation
        phi = this.angle;
        deltaPos = [
            deltaPos[0] * Math.cos(phi) - deltaPos[1] * Math.sin(phi),
            deltaPos[0] * Math.sin(phi) + deltaPos[1] * Math.cos(phi),
        ];

        wheelDifVector = [
            rwRelPos[0] - lwRelPos[0],
            rwRelPos[1] - lwRelPos[1],
        ]

        deltaPhi = Math.atan2(wheelDifVector[0], wheelDifVector[1]) - Math.PI/2;

        newPos = [
            (this.position[0] + deltaPos[0]).clamp(0, window.innerWidth),
            (this.position[1] + deltaPos[1]).clamp(0, window.innerHeight),
        ];

        this.position = newPos;
        this.angle = this.angle + deltaPhi;
    },

    setSpeed(motorSpeeds) {
        this.motorSpeeds = motorSpeeds;
    },
};


function reloadSpeed(callback) {
    let xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                callback(JSON.parse(xhr.responseText));
            }
        }
    }

    xhr.open('GET', 'json');
    xhr.send();
}

function updateData() {
    robot.sensors[0].value = [Math.floor(Math.random() * 255), Math.floor(Math.random() * 255), Math.floor(Math.random() * 255)];
    robot.sensors[1].value = Math.floor(Math.random() * 2);
    robot.sensors[2].value = [Math.random() * 10, Math.random() * 10, Math.random() * 10];
    robot.sensors[3].value = Math.floor(Math.random() * 100);

    fetch(`/update`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({location: {position: robot.position, angle: robot.angle}, sensors: robot.sensors})
  })
}


/* Rresize the canvas to occupy the full page,
   by getting the widow width and height and setting it to canvas*/

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}


function animate() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    ctx.save();
    robot.draw(ctx);
    ctx.restore();

    requestAnimationFrame(animate);
}

setInterval(() => reloadSpeed((s) => robot.setSpeed(s)), 100);
setInterval(() => updateData(), 200);

window.onresize = resize;
resize();
animate();
