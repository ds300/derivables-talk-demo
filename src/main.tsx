import {
  React,
  assign,
  add,
  mul,
  sub,
  divide,
  px
} from './utils'

import { atom, transaction, derivation } from 'derivable'

const $WindowWidth = atom(window.innerWidth);
const $WindowHeight = atom(window.innerHeight);
window.addEventListener('resize', transaction(() => {
  $WindowWidth.set(window.innerWidth);
  $WindowHeight.set(window.innerHeight);
}));

const $MouseX = atom(0);
window.addEventListener('mousemove', e => {
  $MouseX.set(e.pageX);
});

// the logical index of the leftmost column on screen
const $ColumnOffset = atom(0)

// the total number of columns in our spreadsheet.
// need to know to make slider size proportional
const $TotalColumns = atom(20);

const header = <div className='header'></div>;
const slider = <div className='slider'></div>;

const CELL_WIDTH = 100;
const CELL_HEIGHT = 20;
const SLIDER_BREADTH = 10;

// number of columns which can be (fully) shown on page
const $numColumns = $WindowWidth.derive(divide, CELL_WIDTH)
                                .derive(Math.floor);

// need to scale up from column units to pixels
const $scale = $WindowWidth.derive(divide, $TotalColumns);

const $sliderLength = $numColumns.derive(mul, $scale)
                                 .derive(Math.round);
// left means 'leftmost point', x position, etc.
const $sliderLeft = $ColumnOffset.derive(mul, $scale)
                                 .derive(Math.round);

const $sliderTop = $WindowHeight.derive(sub, SLIDER_BREADTH);

const $sliderStyle = derivation(() => {
  return {
    height: px(SLIDER_BREADTH),
    width: px($sliderLength.get()),
    top: px($sliderTop.get()),
    left: px($sliderLeft.get())
  }
});

$sliderStyle.react(style => assign(slider.style, style));


// create a cell for a particular index in [0..numColumns]
function makeCell (index) {
  const cell = <div className='header-cell'></div>;

  assign(cell.style, {
    width: px(CELL_WIDTH),
    height: px(CELL_HEIGHT),
    left: px(index * CELL_WIDTH),
    top: px(0)
  });

  // create offset version of our index and update the
  // text content of the cell when it changes
  const $offsetIndex = $ColumnOffset.derive(add, index);
  const reactor = $offsetIndex.react(i => cell.innerText = i);

  // stop the reactor and remove the cell when no longer
  // needed
  $numColumns.react(function (n) {
    if (n <= index) {
      cell.remove();
      reactor.stop()
      this.stop();
    }
  })

  return cell;
}

// react to changes in $numColumns, creating
// header cells as the page widens
$numColumns.react(n => {
  const cells = header.children,
        len = cells.length;
  if (len < n) {
    // need more cells
    for (let i = len; i < n; i++) {
      header.appendChild(makeCell(i));
    }
  }
  // cells remove themselves now
});




window.addEventListener('load', () => {
  document.body.appendChild(header)
  document.body.appendChild(slider)
});

// press left and right arrow keys to change column offset
window.addEventListener('keydown', e => {
  console.log(e.keyCode);
  switch (e.keyCode) {
    case 39: $ColumnOffset.swap(add, 1); break;
    case 37: $ColumnOffset.swap(sub, 1); break;
    case 38: $TotalColumns.swap(add, 1); break;
    case 40: $TotalColumns.swap(sub, 1); break;
  }
})
