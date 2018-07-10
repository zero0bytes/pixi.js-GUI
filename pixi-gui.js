
// import SimpleWSocket from 'SimpleWSocket.js';


parser = new DOMParser();
var TXTmessage = "";
var gESP_MILLIS = 0;
var TempKolumna = "0.00";
var TempBeczka  = "0.00";
var TempGlowica = "0.00";
var TempWoda    = "0.00";
var TempAlarm   = "0.00";
var TempBufor   = "0.00";
var audio_beep = new Audio("beep.mp3");
var wss;


const WsStateDisconnected  = 0;
const WsStateDisconnecting = 1;
const WsStateConnected     = 2;
const WsStateConnecting    = 3;

class SimpleWSocket
{
    constructor(url)
    {
      this.wsState = WsStateDisconnected;
      this.timer = null;
      this.url = url;
      this.ws = null;
      this.isreconnect = false;
      this.attempts = 0;
    }

    connect()
    {
      if(this.wsState === WsStateConnected)
      {
        this.disconnect();
      }

      if (this.wsState !== WsStateDisconnected)
      {
        console.log('connection is busy')
        return
      }

      this.wsState = WsStateConnecting;
      this.ws = null;
      this.ws = new WebSocket(this.url);
      this.ws.binaryType = 'arraybuffer';
      this.attempts++;	

      this.ws.onmessage = function (e)
      {
        if (typeof e.data === 'string')
        {
            // console.log('string:', e.data)
            TXTmessage = e.data;
        } else
        {
         if (e.data.byteLength > 0)
         {
              
         }
        }
      }.bind(this);

      this.ws.onclose = function (e)
      {
        console.log(e);
        this.wsState = WsStateDisconnected;
        this.onclose();

        if (this.isreconnect)
        {
          if (typeof this.timer !== 'undefined' || this.timer !== null)
          {
            clearInterval(this.timer);
            this.timer = null;
          }

          this.timer = setInterval(function ()
          {
            if (this.isconnected() == false)
            {
			  this.connect();
            }
          }.bind(this), 5000);
        }
      }.bind(this);

      this.ws.onerror = function (e)
      {
        console.log(e);  
        this.disconnect();
      }.bind(this);

     this.ws.onopen = function (e)
     {
		console.log('connection onopen')  
        this.wsState = WsStateConnected;
        if (this.wsState === WsStateConnected)
        {
          this.onopen();
        } else
        {
          console.log('connection is closed or closing')
        }
     }.bind(this);
    }

    disconnect()
    {
      //this.setreconnect(false);
      if (this.ws !== null)
      {
        if (this.wsState === WsStateConnected)
        {
          this.onclose();
          this.wsState = WsStateDisconnecting;
          this.ws.close(1000, 'doclose');
        } else
        {
          console.log('connection is not complete');
        }
      }else
      {
        console.log('WebSocket session is null');
      }
    }

    isconnected()
    {
      return this.wsState === WsStateConnected ? true : false;
    }
    
    connect_num()
    {
      return this.attempts;
    }

    setreconnect(ok)
    {
      if (ok)
      {
        this.isreconnect = true;
      } else
      {
        this.isreconnect = false;
        if (typeof this.timer !== 'undefined' || this.timer !== null)
        {
          clearInterval(this.timer);
          this.timer = null;
        }
      }
    }

    postmessage(message)
    {
      if (this.wsState === WsStateConnected)
      {
          this.ws.send(message);
      } else
      {
        console.log('connection is closed or closing')
      }
    }

    // virtual
    onclose()
    {
    }
    onopen()
    {
      console.log('connection is open')
      this.ws.send("data please...");
    }
    onmessage(message)
    {
    }
}

function play_audio()
{
   audio_beep.pause();
   audio_beep.currentTime = 0;
   audio_beep.volume = 1;
   audio_beep.play();
}

      
class Thermometer extends PIXI.Sprite
{
      constructor(bwidth,posX,posY,txt_size,temperature)
      {
        super();
        
        this.tmp = temperature;
        this.graphics = new PIXI.Graphics();
        this.graphics.beginFill(0xFF3300);
        this.graphics.lineStyle(2, 0xFF00FF, 1);
        this.graphics.beginFill(0xFF00BB, 0.25);
        this.graphics.drawRoundedRect(posX,posY - (this.tmp * 2), bwidth, this.tmp * 2, 10);
        this.graphics.endFill();
        this.bwidth = bwidth;
        this.posX = posX;
        this.posY = posY;
        
        
        var txt_style = new PIXI.TextStyle
        ({
		 fontFamily: 'Arial',
		 fontSize: txt_size,
		 fontStyle: '',
		 fontWeight: 'bold',
		 fill: ['#ffffff', '#00AAFE'], // gradient
		 stroke: '#5B0037',
		 strokeThickness: 1,
		 dropShadow: true,
		 dropShadowColor: '#000000',
		 dropShadowBlur: 6,
		 dropShadowAngle: Math.PI / 6,
		 dropShadowDistance: 6,
		 wordWrap: true,
		 wordWrapWidth: 250
	    });
        
        
        for(var lop = 0; lop < 60;lop ++)
        {
         this.line = new PIXI.Graphics();
         this.line.beginFill(0xFFFF00);
         var color =  (255 << 16) + (lop*22 << 8) + 0;  // R->G->B
         this.line.lineStyle(1, 0x00FF00 , 1);
         this.line.moveTo(posX - 6, posY - (lop * 4) - 0.7);
         this.line.lineTo(posX - 4, posY - (lop * 4) - 0.7);
         this.line.endFill();
         this.addChild(this.line);
       	}
        
        for(var lop = 0; lop < 260;lop +=20)
        {
         this.line = new PIXI.Graphics();
         this.line.beginFill(0xFFFF00);
         var color =  (255 << 16) + (lop*22 << 8) + 0;  // R->G->B
         this.line.lineStyle(1, 0xFFFF00 , 1);
         this.line.moveTo(posX - 6, posY - lop);
         this.line.lineTo(posX + 8, posY - lop);
         this.line.endFill();
         this.addChild(this.line);
       	}
        
        
        this.basicText = new PIXI.Text(this.tmp,txt_style);
        this.basicText.x = posX - 17;
        this.basicText.y = posY;
        this.addChild(this.graphics);
        this.addChild(this.basicText);
      }
      
      SetTemp(tmpnumber)
      {   
		  this.graphics.clear();
		  this.graphics.beginFill(0xFF3300);
          this.graphics.lineStyle(2, 0xFF00FF, 1);
          this.graphics.beginFill(0xFF00BB, 0.25); //0xFF00BB
          // drawRoundedRect (x, y, width, height, radius)
          this.graphics.drawRoundedRect(this.posX, this.posY - (tmpnumber * 2), this.bwidth, tmpnumber * 2, 8);
          this.graphics.endFill();
		  this.basicText.text = tmpnumber + " °C";
	  }
}
   
class ButtonTxt extends PIXI.Sprite
{
      constructor(b_name, bx, by, bwidth, bheight, btn_file, bt_text, txt_x, txt_y, cbf)
      {
        super();
        
        this.self = this;
        
        this.SpriteSheetImage  = PIXI.BaseTexture.fromImage(btn_file);
        this.textureButton = new PIXI.Texture(this.SpriteSheetImage,
	                                         new PIXI.Rectangle(0, 0, bwidth, bheight));
	    this.textureButtonOver = new PIXI.Texture(this.SpriteSheetImage,
	                                            new PIXI.Rectangle(bwidth, 0, bwidth, bheight));	
	    this.textureButtonDown = new PIXI.Texture(this.SpriteSheetImage,
	                                            new PIXI.Rectangle(bwidth * 2, 0, bwidth, bheight));
        
        this.texture = this.textureButton;
        this.clicked = false;
        this.btn_name = b_name;
        
        this.callback_f = cbf;
        
        this.anchor.set(0.0);
		this.x = bx;
		this.y = by;
		this.alpha = 1;
		this.interactive = true;
		this.buttonMode  = true;
		this.on('pointerdown', this.onButtonDown);
		this.on('pointerup', this.onButtonUp);
		this.on('pointerupoutside', this.onButtonUp);
		this.on('pointerover', this.onButtonOver);
		this.on('pointerout', this.onButtonOut);
        
       
        var txt_style = new PIXI.TextStyle({
		 fontFamily: 'Arial',
		 fontSize: 14,
		 fontStyle: '',
		 fontWeight: 'bold',
		 fill: ['#00FF11', '#004305'], // gradient
		 stroke: '#003800',
		 strokeThickness: 1,
		 dropShadow: true,
		 dropShadowColor: '#000000',
		 dropShadowBlur: 4,
		 dropShadowAngle: Math.PI / 6,
		 dropShadowDistance: 6,
		 wordWrap: true,
		 wordWrapWidth: 440
		});

	this.richText = new PIXI.Text(bt_text, txt_style);
	this.richText.x = txt_x;
	this.richText.y = txt_y;
	this.addChild(this.richText);
   }
     
    reset()
    {
		this.clicked = false;
	}
    
    onButtonDown()
	{
    	play_audio();
		this.texture = this.textureButtonDown;
		this.clicked = true;
		this.callback_f(this.btn_name);
	}
	onButtonUp()
	{
		//this.texture = this.textureButton;
	}
	onButtonOver()
	{
		this.texture = this.textureButtonOver;
	}
	onButtonOut()
	{
		this.texture = this.textureButton;
	}   
}

class Button extends PIXI.Sprite
{
	
	  constructor(b_name, bx, by, bwidth, bheight, btn_file, cbf)
      {
        super();
        
        if (typeof cbf === 'function')
        {
        	console.log("function...");
        }else
        {
        	console.log("NOT function...");
        }
        
        
        this.SpriteSheetImage  = PIXI.BaseTexture.fromImage(btn_file);
        this.textureButton = new PIXI.Texture(this.SpriteSheetImage,
	                                         new PIXI.Rectangle(0, 0, bwidth, bheight));
	    this.textureButtonOver = new PIXI.Texture(this.SpriteSheetImage,
	                                            new PIXI.Rectangle(bwidth, 0, bwidth, bheight));	
	    this.textureButtonDown = new PIXI.Texture(this.SpriteSheetImage,
	                                            new PIXI.Rectangle(bwidth * 2, 0, bwidth, bheight));
        
        this.texture  = this.textureButton;
        this.btn_name = b_name;
        this.clicked  = false;
        
        this.callback_f = cbf;
        
        this.anchor.set(0.0);
		this.x = bx;
		this.y = by;
		this.alpha = 1;
		this.interactive = true;
		this.buttonMode  = true;
		this.on('pointerdown', this.onButtonDown);
		this.on('pointerup', this.onButtonUp);
		this.on('pointerupoutside', this.onButtonUp);
		this.on('pointerover', this.onButtonOver);
		this.on('pointerout', this.onButtonOut);
  
   }
 
    reset()
    {
		this.clicked = false;
	}
    
    onButtonDown()
	{
		play_audio();
		this.texture = this.textureButtonDown;
		this.clicked = true;
		this.callback_f(this.btn_name);
	}
	onButtonUp()
	{
		//this.texture = this.textureButton;
	}
	onButtonOver()
	{
		this.texture = this.textureButtonOver;
	}
	onButtonOut()
	{
		this.texture = this.textureButton;
	}   
}


class CreatePOP_ok_no extends PIXI.Sprite
{
      constructor(pop_name, pop_x, pop_y, pop_file, pop_text, p_callback)
      {
        super();
        
        this.self = this;
      
        this.action = "";
        
        this.popup_name = pop_name;
        this.pop_callback = p_callback;
        
        this.status = 0;
        this.texture = new PIXI.Texture.fromImage(pop_file);
        this.anchor.set(0.5);
        this.x = pop_x;
        this.y = pop_y;
        this.alpha = 0.95;
        this.visible = false;        
        this.tak = new Button("tak", 60, 50 , 82, 60,'/img/diody/tak_tileset.png',this.callback.bind(this));
        this.nie = new Button("nie", -120, 50 , 82, 60,'/img/diody/nie_tileset.png',this.callback.bind(this));
        this.addChild(this.tak);
        this.addChild(this.nie);    
       
          
    var txt_style = new PIXI.TextStyle
    ({
		fontFamily: 'Arial',
		fontSize: 22,
		fontStyle: '',
		fontWeight: 'bold',
		fill: ['#ffffff', '#00AAFE'], // gradient
		stroke: '#5B0037',
		strokeThickness: 1,
		dropShadow: true,
		dropShadowColor: '#000000',
		dropShadowBlur: 6,
		dropShadowAngle: Math.PI / 6,
		dropShadowDistance: 6,
		wordWrap: true,
		wordWrapWidth: 250
    });

    this.richText   = new PIXI.Text(pop_text, txt_style);
    this.richText.x = -120;
    this.richText.y = -50;
    this.addChild(this.richText);
   }

      
   hide()
   {
   	   this.visible = false;
   	   this.pop_callback(this.popup_name);
   }
   
   show()
   {
	  this.visible = true;
	  this.action = "";
   }
          
   callback(btn_name)
   {
     setTimeout(this.self.hide.bind(this), 400);
     
     this.action = btn_name;
     
     
    console.log(btn_name);
   }
	    
}

class CreatePOP_ok extends PIXI.Sprite
{
      constructor(pop_name, pop_x, pop_y, pop_file, pop_text, p_callback)
      {
        super();
        
        this.self = this;
      
        this.action = "";
        
        this.popup_name = pop_name;
        this.pop_callback = p_callback;
        
        this.status = 0;
        this.texture = new PIXI.Texture.fromImage(pop_file);
        this.anchor.set(0.5);
        this.x = pop_x;
        this.y = pop_y;
        this.alpha = 0.95;
        this.visible = false;        
        // constructor(b_name, bx, by, bwidth, bheight, btn_file, cbf)
        this.tak = new Button("ok", 60, 40 , 82, 60,'/img/diody/tak_tileset.png',this.callback.bind(this));
        this.addChild(this.tak);
         
          
    var txt_style = new PIXI.TextStyle
    ({
		fontFamily: 'Arial',
		fontSize: 22,
		fontStyle: '',
		fontWeight: 'bold',
		fill: ['#ffffff', '#00AAFE'], // gradient
		stroke: '#5B0037',
		strokeThickness: 1,
		dropShadow: true,
		dropShadowColor: '#000000',
		dropShadowBlur: 6,
		dropShadowAngle: Math.PI / 6,
		dropShadowDistance: 6,
		wordWrap: true,
		wordWrapWidth: 250
    });

    this.richText   = new PIXI.Text(pop_text, txt_style);
    this.richText.x = -120;
    this.richText.y = -50;
    this.addChild(this.richText);
   }

      
   hide()
   {
   	   this.visible = false;
   	   this.pop_callback(this.popup_name);
   }
   
   show()
   {
	  this.visible = true;
	  this.action = "";
   }
          
   callback(btn_name)
   {
     setTimeout(this.self.hide.bind(this), 400);
     
     this.action = btn_name;
     
     
    console.log(btn_name);
   }
	    
}
     
class MainScreen
{
      constructor()
      {
        this.renderer = PIXI.autoDetectRenderer(64, 64, {backgroundColor : 0x000000});
        this.renderer.view.style.position = "absolute";
        this.renderer.view.style.display  = "block";
        this.renderer.autoResize = true;
        this.renderer.resize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.view);
       
        this.MainScreen  = new PIXI.Container();
        
        this.background = PIXI.Sprite.fromImage('/img/background-02.png');
        this.background.x = this.renderer.screen.width/2;
        this.background.y = this.renderer.screen.height/2;
        this.background.anchor.set(0.5);
        this.MainScreen.addChild(this.background);
     
              
        this.TempKolumna = new Thermometer(25,400,345,16,10);
        this.TempGlowica = new Thermometer(25,500,345,16,10);
        this.TempBeczka  = new Thermometer(25,600,345,16,10);
        this.TempWoda    = new Thermometer(25,700,345,16,10);
          
        this.bt_auto   = new ButtonTxt("AUTO",1120, 480, 82, 60,'/img/diody/empty_btn_tileset.png',"AUTO",23,20,this.btn_callback.bind(this));
        this.bt_man    = new ButtonTxt("MAN",1120, 550, 82, 60,'/img/diody/empty_btn_tileset.png',"MAN",25,20,this.btn_callback.bind(this));
        this.bt_menu   = new ButtonTxt("MENU",1120, 620, 82, 60,'/img/diody/empty_btn_tileset.png',"MENU",22,20,this.btn_callback.bind(this));
        
        this.pop_ok_no = new CreatePOP_ok_no("ask_exit_app",window.innerWidth/2,
                                         window.innerHeight/2,
                                         '/img/diody/popup_bkg.png',
                                         "Czy chcesz zamknąć program ?",this.pop_callback.bind(this));
        
        this.pop_ok = new CreatePOP_ok("ask_something",window.innerWidth/2,
                														window.innerHeight/2,
                														'/img/diody/popup_bkg2.png',
                                                                        "Fatal Error !!!",this.pop_callback.bind(this));
        
        var txt_style = new PIXI.TextStyle
        ({
    		fontFamily: 'Arial',
    		fontSize: 12,
    		fontStyle: '',
    		fontWeight: 'bold',
    		fill: ['#ffffff', '#00AAFE'], // gradient
    		stroke: '#5B0037',
    		strokeThickness: 1,
    		dropShadow: true,
    		dropShadowColor: '#000000',
    		dropShadowBlur: 4,
    		dropShadowAngle: Math.PI / 6,
    		dropShadowDistance: 3,
    		wordWrap: true,
    		wordWrapWidth: 250
        });
        this.RPI_counter  = new PIXI.Text("", txt_style);
        this.RPI_counter.x = 380;
        this.RPI_counter.y = 670;
        this.MainScreen.addChild(this.RPI_counter);
        
        
        this.time  = new PIXI.Text(Date(), txt_style);
        this.time.x = 480;
        this.time.y = 670;
        this.MainScreen.addChild(this.time);
 
        
        this.MainScreen.addChild(this.TempKolumna);
        this.MainScreen.addChild(this.TempGlowica);
        this.MainScreen.addChild(this.TempBeczka);
        this.MainScreen.addChild(this.TempWoda);
        this.MainScreen.addChild(this.bt_auto);
        this.MainScreen.addChild(this.bt_man);
        this.MainScreen.addChild(this.bt_menu);
        this.MainScreen.addChild(this.pop_ok_no);
        this.MainScreen.addChild(this.pop_ok);
        
        this.MainScreen.visible = true;
        
        setInterval(this.EverySecondTimer.bind(this), 1000);
 
      }
      
          
      animate()
      {
     	//this.container.render();  
        this.renderer.render(this.MainScreen);
        window.requestAnimationFrame(this.animate.bind(this));
        this.logic();        
      }
      
      EverySecondTimer()
      {
    	  this.time.text = Date();
    	  this.RPI_counter.text = "RPI: " + gESP_MILLIS;
      }
      
      pop_callback(pop_name)
      {
    	  console.log(pop_name);  
      }
      
      btn_callback(bt_name)
      {
    	  console.log(bt_name);  
      }
      
                 
      logic()
      {
		//this.termo1.SetTemp(100);
		this.TempKolumna.SetTemp(TempKolumna);
		this.TempGlowica.SetTemp(TempGlowica);
		this.TempBeczka.SetTemp(TempBeczka);
		this.TempWoda.SetTemp(TempWoda);

				
				
		if(this.bt_auto.clicked == true)
		{
		     this.pop_ok_no.show(); 
		     this.bt_auto.reset();
		}
		
		if(this.bt_man.clicked == true)
		{
			this.pop_ok .show(); 
			this.bt_man.reset();
		}
		     
				
	  }

}

class IntroScreen
{
      constructor()
      {
        this.renderer = PIXI.autoDetectRenderer(64, 64, {backgroundColor : 0x000000});
        this.renderer.view.style.position = "absolute";
        this.renderer.view.style.display  = "block";
        this.renderer.autoResize = true;
        this.renderer.resize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.view);
       
        this.stage  = new PIXI.Container();
        
                  
        var txt_style = new PIXI.TextStyle
        ({
    		fontFamily: 'Arial',
    		fontSize: 12,
    		fontStyle: '',
    		fontWeight: 'bold',
    		fill: ['#ffffff', '#00AAFE'], // gradient
    		stroke: '#5B0037',
    		strokeThickness: 1,
    		dropShadow: true,
    		dropShadowColor: '#000000',
    		dropShadowBlur: 4,
    		dropShadowAngle: Math.PI / 6,
    		dropShadowDistance: 3,
    		wordWrap: true,
    		wordWrapWidth: 250
        });
        this.RPI_counter  = new PIXI.Text("", txt_style);
        this.RPI_counter.x = 380;
        this.RPI_counter.y = 670;
        this.stage.addChild(this.RPI_counter);
        
                
        this.stage.visible = true;
        
        setInterval(this.EverySecondTimer.bind(this), 1000);
        
         
      }
      
          
      animate()
      {
        this.renderer.render(this.stage);
        window.requestAnimationFrame(this.animate.bind(this));
        this.logic();        
      }
      
      EverySecondTimer()
      {
    	  this.time.text = Date();
    	  this.RPI_counter.text = "RPI: " + gESP_MILLIS;
      }
      
                    
      logic()
      {

				
	  }

}

wss = new SimpleWSocket("wss://" + document.location.host + "/ws");
wss.setreconnect(true);
wss.connect();


var main_screen = new MainScreen();
main_screen.animate();



function init()
{
  setInterval("GUI_Update()", 1000);
}

function GUI_Update()
{
  if(TXTmessage.startsWith("<?xml") == true)
  {
	if(window.DOMParser)
    {
        var xmlDoc = parser.parseFromString(TXTmessage, "text/xml");
    }
        else // Internet Explorer
    {
        var xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
        xmlDoc.async = false;
        xmlDoc.loadXML(TXTmessage);
    }
    
    TempKolumna = xmlDoc.getElementsByTagName("tempkolumna")[0].childNodes[0].nodeValue;
    TempBeczka  = xmlDoc.getElementsByTagName("tempbeczka")[0].childNodes[0].nodeValue;
    TempGlowica = xmlDoc.getElementsByTagName("tempglowica")[0].childNodes[0].nodeValue;
    TempWoda    = xmlDoc.getElementsByTagName('tempwoda')[0].childNodes[0].nodeValue;
    TempAlarm   = xmlDoc.getElementsByTagName('tempalarm')[0].childNodes[0].nodeValue;
    TempBufor   = xmlDoc.getElementsByTagName('tempbufor')[0].childNodes[0].nodeValue;

	gESP_MILLIS = parseInt(xmlDoc.getElementsByTagName('sESP_MILLIS')[0].childNodes[0].nodeValue);
  }
  
  if(wss.isconnected() == true)
       wss.postmessage("data please...");
  
    
}


