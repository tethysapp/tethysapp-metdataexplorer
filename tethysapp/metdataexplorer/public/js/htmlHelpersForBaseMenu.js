let addAdditionalDimension;
let moveCarouselLeft;
let moveCarouselRight;
let timeDimensionContainer;
let xyDimensionContainer;

addAdditionalDimension = function (dimension) {
    let html = `<div class="selectpicker-group">
                <div class="selectpicker-prepend width-5-em">Dimension:</div>
                <div class="file-metadata-inner metadata-info-icon" style="width: 5em">
                    <button value="${dimension}" class="metadata-info btn btn-primary">
                        <i class="fas fa-info-circle"></i>
                    </button>
                </div>
                <div id="dimension-additional-${dimension}-select" class="selectpicker-prepend width-33min-5em">${dimension}</div>
                    <select id="dimension-additional-${dimension}-select-values" class="selectpicker additional-dimension" 
                    data-dropup-auto="false" data-style="btn-primary" data-width="calc(66.6% - 5em)">
                    </select>
                </div>`;
    return html;
};

moveCarouselLeft = function () {
    let containerToMove;
    let newHash = parseInt(window.location.hash.slice(1));

    if (newHash >= 4) {
        newHash = 1;
        containerToMove = 3;
    } else {
        newHash += 1;
        if (newHash === 4 || newHash === 3) {
            containerToMove = newHash - 2;
        } else {
            containerToMove = newHash + 2;
        }
    }
    $(".carousel-item").animate({left: '-=100%'}, {
        duration: 700,
        easing: "swing",
        complete: function () {
            $(`#carousel-container-${containerToMove}`).css({left: "200%"});
        }
    });
    window.location.hash = newHash;
    $(".single-indicator").removeClass("active");
    $(`#indicator-${newHash}`).addClass("active");
};

moveCarouselRight = function () {
    let containerToMove;
    let newHash = parseInt(window.location.hash.slice(1));
    if (newHash <= 1) {
        newHash = 4;
        containerToMove = 3;
    } else {
        newHash -= 1;
        if (newHash === 1) {
            containerToMove = 4;
        } else {
            containerToMove = newHash - 1;
        }
    }
    $(".carousel-item").animate({left: '+=100%'}, {
        duration: 700,
        easing: "swing",
        complete: function () {
            $(`#carousel-container-${containerToMove}`).css({left: "-100%"});
        }
    });
    window.location.hash = newHash;
    $(".single-indicator").removeClass("active");
    $(`#indicator-${newHash}`).addClass("active");
};

timeDimensionContainer = function (dimension) {
    const html = `<div class="selectpicker-group">
                    <div class="selectpicker-prepend width-5-em">Time:</div>
                    <div class="file-metadata-inner metadata-info-icon" style="width: 5em">
                        <button value="${dimension}" class="metadata-info btn btn-primary">
                            <i class="fas fa-info-circle"></i>
                        </button>
                    </div>
                    <div id="dimension-time-${dimension}-select" class="selectpicker-prepend width-33min-5em">${dimension}</div>
                    <select id="dimension-time-${dimension}-first" className="selectpicker" data-dropup-auto="false" data-style="btn-primary" data-width="calc(33.3% - 5em)"></select>
                    <div class="selectpicker-prepend width-5-em">to</div>
                    <select id="dimension-time-${dimension}-second" className="selectpicker" data-dropup-auto="false" data-style="btn-primary" data-width="calc(33.3% - 10em)"></select>
                </div>`;
    return html;
};

xyDimensionContainer = function (dimension, type) {
    const html = `<div class="selectpicker-group">
                      <div class="selectpicker-prepend width-5-em">${type}:</div>
                      <div class="file-metadata-inner metadata-info-icon" style="width: 5em">
                          <button value="${dimension}" class="metadata-info btn btn-primary">
                              <i class="fas fa-info-circle"></i>
                          </button>
                      </div>
                      <div id="dimension-${type}-${dimension}-select" class="selectpicker-prepend width-33min-5em">${dimension}</div>
                      <div id="dimension-${type}-${dimension}-first" class="selectpicker-prepend width-33min-5em"></div>
                      <div class="selectpicker-prepend width-5-em">to</div>
                      <div id="dimension-${type}-${dimension}-second" class="selectpicker-prepend width-33min-5em"></div>
                </div>`;
    return html;
};

export {
    addAdditionalDimension,
    moveCarouselLeft,
    moveCarouselRight,
    timeDimensionContainer,
    xyDimensionContainer
}