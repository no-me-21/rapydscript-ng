(function(){
    function _$rapyd$_bind(fn, thisArg) {
        if (fn.orig) fn = fn.orig;
        var ret = function() {
            return fn.apply(thisArg, arguments);
        }
        ret.orig = fn;
        return ret;
    }
    function _$rapyd$_unbindAll(thisArg, rebind) {
        for (var p in thisArg) {
            if (thisArg[p] && thisArg[p].orig) {
                if (rebind) thisArg[p] = _$rapyd$_bind(thisArg[p], thisArg);
                else thisArg[p] = thisArg[p].orig;
            }
        }
    }
    function len(obj) {
        if (obj instanceof Array || typeof obj === "string") return obj.length;
        else {
            var count = 0;
            for (var i in obj) {
                if (obj.hasOwnProperty(i)) count++;
            }
            return count;
        }
    }
    function _$rapyd$_in(val, arr) {
        if (arr instanceof Array || typeof arr === "string") return arr.indexOf(val) != -1;
        else return val in arr;
    }
    _$rapyd$_unbindAll(this, true);
    var BRUSH, ERASER, LINE, SELECT, COLORSELECT, LASSO, RECT, ELLIPSE, SAMPLER, BUCKET, TEXT, X, Y, CLICK, RCLICK;
        BRUSH = 0;

    ERASER = 1;

    LINE = 2;

    SELECT = 3;

    COLORSELECT = 4;

    LASSO = 5;

    RECT = 6;

    ELLIPSE = 7;

    SAMPLER = 8;

    BUCKET = 9;

    TEXT = 10;

    X = 0;

    Y = 1;

    CLICK = 1;

    RCLICK = 3;

    function Drawing(){
        var self = this;
        _$rapyd$_unbindAll(this, true);
        this.undo = _$rapyd$_bind(this.undo, this);
        this.redo = _$rapyd$_bind(this.redo, this);
        this.setMode = _$rapyd$_bind(this.setMode, this);
        this.setStroke = _$rapyd$_bind(this.setStroke, this);
        this.setFill = _$rapyd$_bind(this.setFill, this);
        this.setWidth = _$rapyd$_bind(this.setWidth, this);
        this.clear = _$rapyd$_bind(this.clear, this);
        this.exportDwg = _$rapyd$_bind(this.exportDwg, this);
        this.invert = _$rapyd$_bind(this.invert, this);
        this.redFilter = _$rapyd$_bind(this.redFilter, this);
        this.greenFilter = _$rapyd$_bind(this.greenFilter, this);
        this.blueFilter = _$rapyd$_bind(this.blueFilter, this);
        this.darken = _$rapyd$_bind(this.darken, this);
        this.lighten = _$rapyd$_bind(this.lighten, this);
        var ctx, $tmpCanvas, tmpCanvas, tmpCtx, canvasWidth, canvasHeight, dragging, points, selection, lastPt, transparent_bg, getXY, normalize, ellipse, drawSpline, sample, matchStartColor, eachPixel, clear, onMouseDown, onMouseMove, onMouseUp, onMouseLeave;
        self._canvas = $("#perm-dwg").get(0);
        self._ctx = ctx = self._canvas.getContext("2d");
        self._undoStack = [];
        self._redoStack = [];
        self._fillColor = null;
        self._strokeColor = null;
        $tmpCanvas = $("#temp-dwg");
        tmpCanvas = $tmpCanvas.get(0);
        tmpCtx = tmpCanvas.getContext("2d");
        canvasWidth = tmpCanvas.width;
        canvasHeight = tmpCanvas.height;
        dragging = false;
        points = [];
        selection = null;
        lastPt = [ 0, 0 ];
        transparent_bg = true;
        getXY = function(obj, event) {
            _$rapyd$_unbindAll(this, true);
            var absolute;
            absolute = $(obj).offset();
            return [event.pageX - absolute.left, event.pageY - absolute.top];
        };
        normalize = function(x, y, width, height) {
            _$rapyd$_unbindAll(this, true);
            if (width < 0) {
                width = -width;
                x = x - width;
            }
            if (height < 0) {
                height = -height;
                y = y - height;
            }
            return [x, y, width, height];
        };
        ellipse = function(context, x, y, width, height) {
            _$rapyd$_unbindAll(this, true);
            var ctrX, ctrY, circ, scaleX, scaleY;
            _$rapyd$_Unpack = normalize(x, y, width, height);
            x = _$rapyd$_Unpack[0];
            y = _$rapyd$_Unpack[1];
            width = _$rapyd$_Unpack[2];
            height = _$rapyd$_Unpack[3];
            ctrX = (x + x + width) / 2;
            ctrY = (y + y + height) / 2;
            circ = Math.max(width, height);
            scaleX = width / circ;
            scaleY = height / circ;
            context.save();
            context.translate(ctrX, ctrY);
            context.scale(scaleX, scaleY);
            context.arc(0, 0, circ / 2, 0, 2 * Math.PI);
            context.restore();
        };
        drawSpline = function(context, lastPoint) {
            _$rapyd$_unbindAll(this, true);
            if (lastPoint === undefined) {
                lastPoint = points[len(points) - 1];
            }
            context.beginPath();
            context.moveTo(points[0][X], points[0][Y]);
            if (len(points) == 1) {
                context.lineTo(lastPoint[X], lastPoint[Y]);
            } else if (len(points) == 2) {
                context.quadraticCurveTo(points[1][X], points[1][Y], lastPoint[X], lastPoint[Y]);
            } else {
                context.bezierCurveTo(points[1][X], points[1][Y], points[2][X], points[2][Y], lastPoint[X], lastPoint[Y]);
            }
            context.stroke();
        };
        sample = function(x, y, click) {
            _$rapyd$_unbindAll(this, true);
            var data, color, color, tag, tag, color;
            data = ctx.getImageData(x, y, 1, 1).data;
            if (data[3]) {
                color = "rgb(" + data[0] + "," + data[1] + "," + data[2] + ")";
            } else {
                color = "transparent";
            }
            if (click == CLICK) {
                tag = "#stroke";
            } else {
                tag = "#fill";
            }
            if (color == "transparent") {
                color = null;
                $(tag).css("background", "");
            } else {
                $(tag).css("background", color);
            }
            if (click == CLICK) {
                self._brushColor = color;
            } else {
                self._fillColor = color;
            }
        };
        matchStartColor = function(colorLayer, pixelPos, startPixel) {
            _$rapyd$_unbindAll(this, true);
            var r, g, b, a;
            r = colorLayer[pixelPos];
            g = colorLayer[pixelPos + 1];
            b = colorLayer[pixelPos + 2];
            a = colorLayer[pixelPos + 3];
            return r == startPixel[0] && g == startPixel[1] && b == startPixel[2] && !!(a) == !!(startPixel[3]);
        };
        eachPixel = function(imageData, callback) {
            _$rapyd$_unbindAll(this, true);
            var offset, length, offset;
            offset = 0;
            length = imageData.height * imageData.width * 4;
            while (offset < length) {
                callback(offset);
                offset += 4;
            }
        };
        self._clear = clear = function(context) {
            _$rapyd$_unbindAll(this, true);
            context.clearRect(0, 0, canvasWidth, canvasHeight);
        };
        onMouseDown = function(event) {
            _$rapyd$_unbindAll(this, true);
            var x, y, pixelStack, colorLayer, data, startPixel, locX, locY, swatchPixel, newPos, x, y, pixelPos, y, pixelPos, pixelPos, y, reachLeft, reachRight, y, reachLeft, reachLeft, reachRight, pixelPos, tmp, data, merge;
            event.preventDefault();
            dragging = true;
            _$rapyd$_Unpack = getXY(this, event);
            x = _$rapyd$_Unpack[0];
            y = _$rapyd$_Unpack[1];
            self._undoStack.append(ctx.getImageData(0, 0, canvasWidth, canvasHeight));
            self._redoStack = [];
            ctx.save();
            tmpCtx.save();
            if (_$rapyd$_in(self._mode, [ BRUSH, ERASER ])) {
                ctx.lineWidth = self._lineWidth;
                if (self._mode == BRUSH) {
                    ctx.strokeStyle = self._brushColor;
                } else {
                    ctx.globalCompositeOperation = "destination-out";
                }
                ctx.beginPath();
                ctx.moveTo(x, y);
            } else if (_$rapyd$_in(self._mode, [ RECT, ELLIPSE ])) {
                tmpCtx.lineWidth = self._lineWidth;
                tmpCtx.strokeStyle = self._brushColor;
                tmpCtx.fillStyle = self._fillColor;
                points.append([ x, y ]);
            } else if (self._mode == LINE) {
                tmpCtx.lineWidth = self._lineWidth;
                tmpCtx.strokeStyle = self._brushColor;
                points.append([ x, y ]);
            } else if (self._mode == SAMPLER) {
                sample(x, y, event.which);
            } else if (self._mode == BUCKET && self._fillColor) {
                pixelStack = [ [x, y] ];
                colorLayer = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
                data = colorLayer.data;
                startPixel = ctx.getImageData(x, y, 1, 1).data;
                tmpCtx.save();
                tmpCtx.fillStyle = self._fillColor;
                _$rapyd$_Unpack = [50, 50];
                locX = _$rapyd$_Unpack[0];
                locY = _$rapyd$_Unpack[1];
                tmpCtx.fillRect(locX, locY, 1, 1);
                swatchPixel = tmpCtx.getImageData(locX, locY, 1, 1).data;
                tmpCtx.clearRect(locX, locY, 1, 1);
                tmpCtx.restore();
                if (!matchStartColor(swatchPixel, 0, startPixel)) {
                    while (len(pixelStack)) {
                        newPos = pixelStack.pop();
                        x = newPos[X];
                        y = newPos[Y];
                        pixelPos = (y * canvasWidth + x) * 4;
                        while (y >= 0 && matchStartColor(data, pixelPos, startPixel)) {
                            y -= 1;
                            pixelPos -= canvasWidth * 4;
                        }
                        pixelPos += canvasWidth * 4;
                        y += 1;
                        reachLeft = false;
                        reachRight = false;
                        while (y < canvasHeight - 1 && matchStartColor(data, pixelPos, startPixel)) {
                            y += 1;
                            data[pixelPos] = swatchPixel[0];
                            data[pixelPos + 1] = swatchPixel[1];
                            data[pixelPos + 2] = swatchPixel[2];
                            data[pixelPos + 3] = swatchPixel[3];
                            if (x > 0) {
                                if (matchStartColor(data, pixelPos - 4, startPixel)) {
                                    if (!reachLeft) {
                                        pixelStack.append([x - 1, y]);
                                        reachLeft = true;
                                    }
                                } else if (reachLeft) {
                                    reachLeft = false;
                                }
                            }
                            if (x < canvasWidth - 1) {
                                if (matchStartColor(data, pixelPos + 4, startPixel)) {
                                    if (!reachRight) {
                                        pixelStack.append([x + 1, y]);
                                    }
                                } else if (reachRight) {
                                    reachRight = false;
                                }
                            }
                            pixelPos += canvasWidth * 4;
                        }
                    }
                    ctx.putImageData(colorLayer, 0, 0);
                }
            } else if (self._mode == SELECT) {
                lastPt = [ x, y ];
                if (selection === null) {
                    tmpCtx.lineWidth = 1;
                    tmpCtx.strokeStyle = "rgb(0,255,0)";
                    points.append([ x, y ]);
                } else if (!(points[0][X] < x && x < points[1][X] && points[0][Y] < y && y < points[1][Y])) {
                    if (transparent_bg) {
                        tmp = ctx.getImageData(points[0][X], points[0][Y], points[1][X] - points[0][X], points[1][Y] - points[0][Y]).data;
                        data = selection.data;
                        merge = function(offset) {
                            _$rapyd$_unbindAll(this, true);
                            if (!data[offset + 3]) {
                                data[offset] = tmp[offset];
                                data[offset + 1] = tmp[offset + 1];
                                data[offset + 2] = tmp[offset + 2];
                                data[offset + 3] = tmp[offset + 3];
                            }
                        };
                        eachPixel(selection, merge);
                    }
                    ctx.putImageData(selection, points[0][X], points[0][Y]);
                    clear(tmpCtx);
                    selection = null;
                    points = [ [ x, y ] ];
                }
            }
        };
        onMouseMove = function(event) {
            _$rapyd$_unbindAll(this, true);
            var x, y, x, y, point, x, y;
            if (self._mode == LINE && len(points)) {
                _$rapyd$_Unpack = getXY(this, event);
                x = _$rapyd$_Unpack[0];
                y = _$rapyd$_Unpack[1];
                clear(tmpCtx);
                drawSpline(tmpCtx, [x, y]);
            } else if (dragging) {
                _$rapyd$_Unpack = getXY(this, event);
                x = _$rapyd$_Unpack[0];
                y = _$rapyd$_Unpack[1];
                if (_$rapyd$_in(self._mode, [ BRUSH, ERASER ])) {
                    ctx.lineTo(x, y);
                    ctx.stroke();
                } else if (_$rapyd$_in(self._mode, [ RECT, ELLIPSE ])) {
                    clear(tmpCtx);
                    tmpCtx.beginPath();
                    if (self._mode == RECT) {
                        tmpCtx.rect(points[0][X], points[0][Y], x - points[0][X], y - points[0][Y]);
                    } else {
                        ellipse(tmpCtx, points[0][X], points[0][Y], x - points[0][X], y - points[0][Y]);
                    }
                    if (self._fillColor !== null) {
                        tmpCtx.fill();
                    }
                    if (self._brushColor !== null) {
                        tmpCtx.stroke();
                    }
                } else if (self._mode == SAMPLER) {
                    sample(x, y, event.which);
                } else if (self._mode == SELECT) {
                    clear(tmpCtx);
                    if (selection !== null) {
                        var _$rapyd$_Iter0 = points;
                        for (var _$rapyd$_Index0 = 0; _$rapyd$_Index0 < _$rapyd$_Iter0.length; _$rapyd$_Index0++) {
                            point = _$rapyd$_Iter0[_$rapyd$_Index0];
                            point[0] += x - lastPt[X];
                            point[1] += y - lastPt[Y];
                        }
                        lastPt = [ x, y ];
                        x = points[1][X];
                        y = points[1][Y];
                        tmpCtx.putImageData(selection, points[0][X], points[0][Y]);
                    }
                    tmpCtx.strokeRect(points[0][X], points[0][Y], x - points[0][X], y - points[0][Y]);
                }
            }
        };
        onMouseUp = function(event) {
            _$rapyd$_unbindAll(this, true);
            var x, y, x, y, sx, sy, width, height, sx, sy, width, height, x, y;
            if (_$rapyd$_in(self._mode, [ RECT, ELLIPSE ])) {
                _$rapyd$_Unpack = getXY(this, event);
                x = _$rapyd$_Unpack[0];
                y = _$rapyd$_Unpack[1];
                ctx.beginPath();
                ctx.lineWidth = self._lineWidth;
                ctx.strokeStyle = self._brushColor;
                ctx.fillStyle = self._fillColor;
                if (self._mode == RECT) {
                    ctx.rect(points[0][X], points[0][Y], x - points[0][X], y - points[0][Y]);
                } else {
                    ellipse(ctx, points[0][X], points[0][Y], x - points[0][X], y - points[0][Y]);
                }
                if (self._fillColor !== null) {
                    ctx.fill();
                }
                if (self._brushColor !== null) {
                    ctx.stroke();
                }
            } else if (self._mode == LINE && event.which == CLICK && len(points) > 1) {
                ctx.lineWidth = self._lineWidth;
                ctx.strokeStyle = self._brushColor;
                drawSpline(ctx);
            } else if (self._mode == SELECT) {
                _$rapyd$_Unpack = getXY(this, event);
                x = _$rapyd$_Unpack[0];
                y = _$rapyd$_Unpack[1];
                if (selection === null && x != points[0][X] && y != points[0][Y]) {
                    sx = points[0][X];
                    sy = points[0][Y];
                    width = x - sx;
                    height = y - sy;
                    _$rapyd$_Unpack = normalize(sx, sy, width, height);
                    sx = _$rapyd$_Unpack[0];
                    sy = _$rapyd$_Unpack[1];
                    width = _$rapyd$_Unpack[2];
                    height = _$rapyd$_Unpack[3];
                    points = [ [ sx, sy ] ];
                    x = sx + width;
                    y = sy + height;
                    selection = ctx.getImageData(sx, sy, width, height);
                    ctx.clearRect(sx, sy, width, height);
                    tmpCtx.putImageData(selection, points[0][X], points[0][Y]);
                    tmpCtx.strokeRect(points[0][X], points[0][Y], x - points[0][X], y - points[0][Y]);
                    points.append([ x, y ]);
                }
            }
            dragging = false;
            ctx.restore();
            if ((!selection || x == points[0][X] && y == points[0][Y]) && (self._mode != LINE || event.which == CLICK && len(points) > 1)) {
                points = [];
                clear(tmpCtx);
                tmpCtx.restore();
            }
        };
        self._filter = function(callback) {
            _$rapyd$_unbindAll(this, true);
            var pixels, pixels, data, invoke;
            if (selection) {
                pixels = selection;
            } else {
                pixels = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
            }
            data = pixels.data;
            invoke = function(offset) {
                _$rapyd$_unbindAll(this, true);
                callback(data, offset);
            };
            eachPixel(pixels, invoke);
            if (selection) {
                clear(tmpCtx);
                tmpCtx.putImageData(pixels, points[0][X], points[0][Y]);
                tmpCtx.strokeRect(points[0][X], points[0][Y], points[1][X] - points[0][X], points[1][Y] - points[0][Y]);
            } else {
                ctx.putImageData(pixels, 0, 0);
            }
        };
        $tmpCanvas.mousedown(onMouseDown);
        $tmpCanvas.mousemove(onMouseMove);
        $tmpCanvas.mouseup(onMouseUp);
        onMouseLeave = function(event) {
            _$rapyd$_unbindAll(this, true);
            if (dragging) {
                onMouseUp(event);
            }
        };
        $tmpCanvas.mouseleave(onMouseLeave);
        self._ctx.lineJoin = tmpCtx.lineJoin = self._ctx.lineCap = tmpCtx.lineCap = "round";
    };
    Drawing.prototype.undo = function(){
        var self = this;
        _$rapyd$_unbindAll(this, true);
        var state;
        state = self._undoStack.pop();
        if (state) {
            self._redoStack.append(state);
            self._ctx.putImageData(state, 0, 0);
        }
    };
    Drawing.prototype.redo = function(){
        var self = this;
        _$rapyd$_unbindAll(this, true);
        var state;
        state = self._redoStack.pop();
        if (state) {
            self._undoStack.append(state);
            self._ctx.putImageData(state, 0, 0);
        }
    };
    Drawing.prototype.setMode = function(mode){
        var self = this;
        _$rapyd$_unbindAll(this, true);
        self._mode = mode;
    };
    Drawing.prototype.setStroke = function(style){
        var self = this;
        _$rapyd$_unbindAll(this, true);
        self._brushColor = style;
    };
    Drawing.prototype.setFill = function(style){
        var self = this;
        _$rapyd$_unbindAll(this, true);
        self._fillColor = style;
    };
    Drawing.prototype.setWidth = function(value){
        var self = this;
        _$rapyd$_unbindAll(this, true);
        self._lineWidth = value;
    };
    Drawing.prototype.clear = function(){
        var self = this;
        _$rapyd$_unbindAll(this, true);
        self._clear(self._ctx);
    };
    Drawing.prototype.exportDwg = function(){
        var self = this;
        _$rapyd$_unbindAll(this, true);
        return self._canvas.toDataURL();
    };
    Drawing.prototype.invert = function(){
        var self = this;
        _$rapyd$_unbindAll(this, true);
        var invert;
        invert = function(data, offset) {
            _$rapyd$_unbindAll(this, true);
            data[offset] = 255 - data[offset];
            data[offset + 1] = 255 - data[offset + 1];
            data[offset + 2] = 255 - data[offset + 2];
        };
        self._filter(invert);
    };
    Drawing.prototype.redFilter = function(){
        var self = this;
        _$rapyd$_unbindAll(this, true);
        var remove;
        remove = function(data, offset) {
            _$rapyd$_unbindAll(this, true);
            data[offset] = 0;
        };
        self._filter(remove);
    };
    Drawing.prototype.greenFilter = function(){
        var self = this;
        _$rapyd$_unbindAll(this, true);
        var remove;
        remove = function(data, offset) {
            _$rapyd$_unbindAll(this, true);
            data[offset + 1] = 0;
        };
        self._filter(remove);
    };
    Drawing.prototype.blueFilter = function(){
        var self = this;
        _$rapyd$_unbindAll(this, true);
        var remove;
        remove = function(data, offset) {
            _$rapyd$_unbindAll(this, true);
            data[offset + 2] = 0;
        };
        self._filter(remove);
    };
    Drawing.prototype.darken = function(){
        var self = this;
        _$rapyd$_unbindAll(this, true);
        var darken;
        darken = function(data, offset) {
            _$rapyd$_unbindAll(this, true);
            data[offset] /= 2;
            data[offset + 1] /= 2;
            data[offset + 2] /= 2;
        };
        self._filter(darken);
    };
    Drawing.prototype.lighten = function(){
        var self = this;
        _$rapyd$_unbindAll(this, true);
        var lighten;
        lighten = function(data, offset) {
            _$rapyd$_unbindAll(this, true);
            data[offset] = Math.min(data[offset] * 2, 255);
            data[offset + 1] = Math.min(data[offset + 1] * 2, 255);
            data[offset + 2] = Math.min(data[offset + 2] * 2, 255);
        };
        self._filter(lighten);
    };

    function ColorSwatch(){
        var self = this;
        _$rapyd$_unbindAll(this, true);
        var fg, bg;
        fg = $("<div></div>").width(36).height(36).css({
            "position": "absolute",
            "border": "1px solid black"
        });
        fg.change = function(color) {
            _$rapyd$_unbindAll(this, true);
            $(self).css("background", color);
        };
        bg = fg.clone();
        $("#color-swatch");
    };

    function main() {
        _$rapyd$_unbindAll(this, true);
        var dwg, onChange, $brushWidget, triggerChange, $tools, makeMode, $stroke, $fill, setStroke, setFill, $colorPickers, $colorPicker, makeHandler, makeReset, $swatch, idtag, resetid, callback, popupUnder, $menus, makeMenu, hideMenus, $about;
        dwg = new Drawing();
        onChange = function() {
            _$rapyd$_unbindAll(this, true);
            dwg.setWidth($(this).val());
        };
        $brushWidget = $("#brush-size").spinner({
            "min": 1,
            "max": 40
        });
        $brushWidget.change(onChange);
        triggerChange = function() {
            _$rapyd$_unbindAll(this, true);
            $(this).siblings("input").change();
        };
        $(".ui-spinner-button").click(triggerChange);
        $brushWidget.val(1);
        $tools = $(".toolbox-item");
        makeMode = function(mode) {
            _$rapyd$_unbindAll(this, true);
            var setMode;
            setMode = function(event) {
                _$rapyd$_unbindAll(this, true);
                dwg.setMode(mode);
                $tools.removeClass("selected");
                $(event.target).parent().addClass("selected");
            };
            return setMode;
        };
        $("#toolbox-brush").click(makeMode(BRUSH));
        $("#toolbox-eraser").click(makeMode(ERASER));
        $("#toolbox-line").click(makeMode(LINE));
        $("#toolbox-select").click(makeMode(SELECT));
        $("#toolbox-colorselect").click(makeMode(COLORSELECT));
        $("#toolbox-lasso").click(makeMode(LASSO));
        $("#toolbox-rectangle").click(makeMode(RECT));
        $("#toolbox-ellipse").click(makeMode(ELLIPSE));
        $("#toolbox-sampler").click(makeMode(SAMPLER));
        $("#toolbox-bucket").click(makeMode(BUCKET));
        $("#toolbox-text").click(makeMode(TEXT));
        $("#toolbox-brush").click();
        $stroke = $("#stroke");
        $fill = $("#fill");
        setStroke = function(style) {
            _$rapyd$_unbindAll(this, true);
            dwg.setStroke(style);
            $stroke.css("background", style);
        };
        setFill = function(style) {
            _$rapyd$_unbindAll(this, true);
            dwg.setFill(style);
            $fill.css("background", style);
        };
        setStroke("black");
        $colorPickers = $(".colorpicker");
        var _$rapyd$_Iter1 = [ [$stroke, "#fg-color", "#no-stroke", setStroke], [$fill, 
        "#bg-color", "#no-fill", setFill] ];
        for (var _$rapyd$_Index1 = 0; _$rapyd$_Index1 < _$rapyd$_Iter1.length; _$rapyd$_Index1++) {
            _$rapyd$_Unpack = _$rapyd$_Iter1[_$rapyd$_Index1];
            $swatch = _$rapyd$_Unpack[0];
            idtag = _$rapyd$_Unpack[1];
            resetid = _$rapyd$_Unpack[2];
            callback = _$rapyd$_Unpack[3];
            $colorPicker = $(idtag);
            $colorPicker.farbtastic(callback);
            makeHandler = function($target, $popup) {
                _$rapyd$_unbindAll(this, true);
                var showColorpicker;
                showColorpicker = function(event) {
                    _$rapyd$_unbindAll(this, true);
                    $colorPickers.hide();
                    popupUnder(event, $target, $popup);
                };
                return showColorpicker;
            };
            $swatch.click(makeHandler($swatch, $colorPicker));
            makeReset = function($target, setFunction) {
                _$rapyd$_unbindAll(this, true);
                var reset;
                reset = function() {
                    _$rapyd$_unbindAll(this, true);
                    event.stopPropagation();
                    setFunction("transparent");
                    $target.css("background", "");
                };
                return reset;
            };
            $(resetid).click(makeReset($swatch, callback));
        }
        popupUnder = function(event, $element, $popup) {
            _$rapyd$_unbindAll(this, true);
            var absolute;
            event.stopPropagation();
            absolute = $element.offset();
            $popup.css({
                "left": absolute.left,
                "top": absolute.top + $element.outerHeight()
            }).show();
        };
        $menus = $(".menubar-menu");
        makeMenu = function() {
            _$rapyd$_unbindAll(this, true);
            var $this, idtag, showMenu;
            $this = $(this);
            idtag = $this.attr("id").split("-")[2];
            showMenu = function(event) {
                _$rapyd$_unbindAll(this, true);
                $menus.hide();
                popupUnder(event, $this, $("#menubar-menu-" + idtag));
            };
            $this.click(showMenu);
        };
        hideMenus = function() {
            _$rapyd$_unbindAll(this, true);
            $menus.hide();
            $colorPickers.hide();
        };
        $(document).click(hideMenus);
        $menus.menu().removeClass("ui-widget");
        $(".menubar-item").each(makeMenu);
        $("#menubar-menu-item-new").click(function() {
            _$rapyd$_unbindAll(this, true);
            dwg.clear();
        });
        $("#menubar-menu-item-export-to-image").click(function() {
            _$rapyd$_unbindAll(this, true);
            var url;
            url = dwg.exportDwg();
            window.open(url, "_blank");
        });
        $("#menubar-menu-item-undo").click(function() {
            _$rapyd$_unbindAll(this, true);
            dwg.undo();
        });
        $("#menubar-menu-item-redo").click(function() {
            _$rapyd$_unbindAll(this, true);
            dwg.redo();
        });
        $("#menubar-menu-item-invert-colors").click(function() {
            _$rapyd$_unbindAll(this, true);
            dwg.invert();
        });
        $("#menubar-menu-item-red-filter").click(function() {
            _$rapyd$_unbindAll(this, true);
            dwg.redFilter();
        });
        $("#menubar-menu-item-green-filter").click(function() {
            _$rapyd$_unbindAll(this, true);
            dwg.greenFilter();
        });
        $("#menubar-menu-item-blue-filter").click(function() {
            _$rapyd$_unbindAll(this, true);
            dwg.blueFilter();
        });
        $("#menubar-menu-item-darken").click(function() {
            _$rapyd$_unbindAll(this, true);
            dwg.darken();
        });
        $("#menubar-menu-item-lighten").click(function() {
            _$rapyd$_unbindAll(this, true);
            dwg.lighten();
        });
        $about = $("#about").dialog({
            "modal": true
        });
        $("#menubar-menu-item-about").click(function() {
            _$rapyd$_unbindAll(this, true);
            $about.dialog("open");
        });
        window.oncontextmenu = function() {
            _$rapyd$_unbindAll(this, true);
            return false;
        };
    }

    $(document).ready(main);
})();