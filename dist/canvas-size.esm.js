/*!
 * canvas-size
 * v1.2.1
 * https://github.com/jhildenbiddle/canvas-size
 * (c) 2015-2021 John Hildenbiddle <http://hildenbiddle.com>
 * MIT license
 */
function _defineProperty(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}

function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);
    if (Object.getOwnPropertySymbols) {
        var symbols = Object.getOwnPropertySymbols(object);
        if (enumerableOnly) symbols = symbols.filter((function(sym) {
            return Object.getOwnPropertyDescriptor(object, sym).enumerable;
        }));
        keys.push.apply(keys, symbols);
    }
    return keys;
}

function _objectSpread2(target) {
    for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i] != null ? arguments[i] : {};
        if (i % 2) {
            ownKeys(Object(source), true).forEach((function(key) {
                _defineProperty(target, key, source[key]);
            }));
        } else if (Object.getOwnPropertyDescriptors) {
            Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
        } else {
            ownKeys(Object(source)).forEach((function(key) {
                Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
            }));
        }
    }
    return target;
}

function _objectWithoutPropertiesLoose(source, excluded) {
    if (source == null) return {};
    var target = {};
    var sourceKeys = Object.keys(source);
    var key, i;
    for (i = 0; i < sourceKeys.length; i++) {
        key = sourceKeys[i];
        if (excluded.indexOf(key) >= 0) continue;
        target[key] = source[key];
    }
    return target;
}

function _objectWithoutProperties(source, excluded) {
    if (source == null) return {};
    var target = _objectWithoutPropertiesLoose(source, excluded);
    var key, i;
    if (Object.getOwnPropertySymbols) {
        var sourceSymbolKeys = Object.getOwnPropertySymbols(source);
        for (i = 0; i < sourceSymbolKeys.length; i++) {
            key = sourceSymbolKeys[i];
            if (excluded.indexOf(key) >= 0) continue;
            if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
            target[key] = source[key];
        }
    }
    return target;
}

function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
}

function _toConsumableArray(arr) {
    return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
}

function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) return _arrayLikeToArray(arr);
}

function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
}

function _iterableToArray(iter) {
    if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter);
}

function _iterableToArrayLimit(arr, i) {
    if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return;
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;
    try {
        for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
            _arr.push(_s.value);
            if (i && _arr.length === i) break;
        }
    } catch (err) {
        _d = true;
        _e = err;
    } finally {
        try {
            if (!_n && _i["return"] != null) _i["return"]();
        } finally {
            if (_d) throw _e;
        }
    }
    return _arr;
}

function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}

function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
    return arr2;
}

function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

function canvasTest(settings) {
    var size = settings.sizes.shift();
    var width = size[0];
    var height = size[1];
    var fill = [ width - 1, height - 1, 1, 1 ];
    var job = Date.now();
    var isWorker = typeof WorkerGlobalScope !== "undefined" && self instanceof WorkerGlobalScope;
    var cropCvs, testCvs;
    if (isWorker) {
        cropCvs = new OffscreenCanvas(1, 1);
        testCvs = new OffscreenCanvas(width, height);
    } else {
        cropCvs = document.createElement("canvas");
        cropCvs.width = 1;
        cropCvs.height = 1;
        testCvs = document.createElement("canvas");
        testCvs.width = width;
        testCvs.height = height;
    }
    var cropCtx = cropCvs.getContext("2d");
    var testCtx = testCvs.getContext("2d");
    if (testCtx) {
        testCtx.fillRect.apply(testCtx, fill);
        cropCtx.drawImage(testCvs, width - 1, height - 1, 1, 1, 0, 0, 1, 1);
    }
    var isTestPass = cropCtx && cropCtx.getImageData(0, 0, 1, 1).data[3] !== 0;
    var benchmark = Date.now() - job;
    if (isWorker) {
        postMessage({
            width: width,
            height: height,
            benchmark: benchmark,
            isTestPass: isTestPass
        });
        if (!isTestPass && settings.sizes.length) {
            canvasTest(settings);
        }
    } else if (isTestPass) {
        settings.onSuccess(width, height, benchmark);
    } else {
        settings.onError(width, height, benchmark);
        if (settings.sizes.length) {
            canvasTest(settings);
        }
    }
    return isTestPass;
}

var testSizes = {
    area: [ 16384, 14188, 11402, 10836, 11180, 8192, 4096, 1 ],
    height: [ 8388607, 65535, 32767, 16384, 8192, 4096, 1 ],
    width: [ 4194303, 65535, 32767, 16384, 8192, 4096, 1 ]
};

var defaults = {
    max: null,
    min: 1,
    sizes: [],
    step: 1024,
    usePromise: false,
    useWorker: false,
    onError: Function.prototype,
    onSuccess: Function.prototype
};

var workerJobs = {};

function createSizesArray(settings) {
    var isArea = settings.width === settings.height;
    var isWidth = settings.height === 1;
    var isHeight = settings.width === 1;
    var sizes = [];
    if (!settings.width || !settings.height) {
        settings.sizes.forEach((function(testSize) {
            var width = isArea || isWidth ? testSize : 1;
            var height = isArea || isHeight ? testSize : 1;
            sizes.push([ width, height ]);
        }));
    } else {
        var testMin = settings.min || defaults.min;
        var testStep = settings.step || defaults.step;
        var testSize = Math.max(settings.width, settings.height);
        while (testSize >= testMin) {
            var width = isArea || isWidth ? testSize : 1;
            var height = isArea || isHeight ? testSize : 1;
            sizes.push([ width, height ]);
            testSize -= testStep;
        }
    }
    return sizes;
}

function handleMethod(settings) {
    var hasCanvasSupport = window && "HTMLCanvasElement" in window;
    var hasOffscreenCanvasSupport = window && "OffscreenCanvas" in window;
    var jobID = Date.now();
    var _onError = settings.onError, _onSuccess = settings.onSuccess, settingsWithoutCallbacks = _objectWithoutProperties(settings, [ "onError", "onSuccess" ]);
    var worker = null;
    if (!hasCanvasSupport) {
        return false;
    }
    if (settings.useWorker && hasOffscreenCanvasSupport) {
        var js = "\n            var canvasTest = ".concat(canvasTest.toString(), ";\n            onmessage = function(e) {\n                canvasTest(e.data);\n            };\n        ");
        var blob = new Blob([ js ], {
            type: "application/javascript"
        });
        var blobURL = URL.createObjectURL(blob);
        worker = new Worker(blobURL);
        URL.revokeObjectURL(blobURL);
        worker.onmessage = function(e) {
            var _e$data = e.data, width = _e$data.width, height = _e$data.height, benchmark = _e$data.benchmark, isTestPass = _e$data.isTestPass;
            if (isTestPass) {
                workerJobs[jobID].onSuccess(width, height, benchmark);
                delete workerJobs[jobID];
            } else {
                workerJobs[jobID].onError(width, height, benchmark);
            }
        };
    }
    if (settings.usePromise) {
        return new Promise((function(resolve, reject) {
            var promiseSettings = _objectSpread2(_objectSpread2({}, settings), {}, {
                onError: function onError(width, height, benchmark) {
                    var isLastTest;
                    if (settings.sizes.length === 0) {
                        isLastTest = true;
                    } else {
                        var _settings$sizes$slice = settings.sizes.slice(-1), _settings$sizes$slice2 = _slicedToArray(_settings$sizes$slice, 1), _settings$sizes$slice3 = _slicedToArray(_settings$sizes$slice2[0], 2), lastWidth = _settings$sizes$slice3[0], lastHeight = _settings$sizes$slice3[1];
                        isLastTest = width === lastWidth && height === lastHeight;
                    }
                    _onError(width, height, benchmark);
                    if (isLastTest) {
                        reject({
                            width: width,
                            height: height,
                            benchmark: benchmark
                        });
                    }
                },
                onSuccess: function onSuccess(width, height, benchmark) {
                    _onSuccess(width, height, benchmark);
                    resolve({
                        width: width,
                        height: height,
                        benchmark: benchmark
                    });
                }
            });
            if (worker) {
                var onError = promiseSettings.onError, onSuccess = promiseSettings.onSuccess;
                workerJobs[jobID] = {
                    onError: onError,
                    onSuccess: onSuccess
                };
                worker.postMessage(settingsWithoutCallbacks);
            } else {
                canvasTest(promiseSettings);
            }
        }));
    } else {
        if (worker) {
            workerJobs[jobID] = {
                onError: _onError,
                onSuccess: _onSuccess
            };
            worker.postMessage(settingsWithoutCallbacks);
        } else {
            return canvasTest(settings);
        }
    }
}

var canvasSize = {
    maxArea: function maxArea() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        var sizes = createSizesArray({
            width: options.max,
            height: options.max,
            min: options.min,
            step: options.step,
            sizes: _toConsumableArray(testSizes.area)
        });
        var settings = _objectSpread2(_objectSpread2(_objectSpread2({}, defaults), options), {}, {
            sizes: sizes
        });
        return handleMethod(settings);
    },
    maxHeight: function maxHeight() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        var sizes = createSizesArray({
            width: 1,
            height: options.max,
            min: options.min,
            step: options.step,
            sizes: _toConsumableArray(testSizes.height)
        });
        var settings = _objectSpread2(_objectSpread2(_objectSpread2({}, defaults), options), {}, {
            sizes: sizes
        });
        return handleMethod(settings);
    },
    maxWidth: function maxWidth() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        var sizes = createSizesArray({
            width: options.max,
            height: 1,
            min: options.min,
            step: options.step,
            sizes: _toConsumableArray(testSizes.width)
        });
        var settings = _objectSpread2(_objectSpread2(_objectSpread2({}, defaults), options), {}, {
            sizes: sizes
        });
        return handleMethod(settings);
    },
    test: function test() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        var settings = _objectSpread2(_objectSpread2({}, defaults), options);
        settings.sizes = _toConsumableArray(settings.sizes);
        if (settings.width && settings.height) {
            settings.sizes = [ [ settings.width, settings.height ] ];
        }
        return handleMethod(settings);
    }
};

export default canvasSize;
//# sourceMappingURL=canvas-size.esm.js.map
