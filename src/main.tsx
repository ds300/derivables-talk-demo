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
const $NoDragColOffset = atom(0)

// the total number of columns in our spreadsheet.
// need to know to make slider size proportional
const $TotalColumns = atom(20);

// Nested derivable to represent the left position
// of the slider during a drag
const $$DragLeft = atom(null);

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
const $noDragSliderLeft = $NoDragColOffset.derive(mul, $scale)
                                          .derive(Math.round);
// just unpack the nexted derivable to get at the number
// number inside.
const $dragSliderLeft = $$DragLeft.mDerive($left => $left.get());
// mDerive means 'derive if not null'
// like .? operator in c# or coffeescript
const $sliderLeft = $dragSliderLeft.mOr($noDragSliderLeft);
// mOr means 'if the thing on the left is null, use
// the thing on the right'

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

const $dragColOffset = $dragSliderLeft.mDerive(divide, $scale)
                                      .mDerive(Math.round);

const $columnOffset = $dragColOffset.mOr($NoDragColOffset);

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
  const $offsetIndex = $columnOffset.derive(add, index);
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


slider.addEventListener('mousedown', e => {
  // it's not until this event happens and the drag
  // begins that that $$DragLeft piece of global state
  // makes any sense. So this is where it gets set.

  // $dragX is the offset of the mouse's "current" position
  // relative to its actual current position right now (at the
  // start of the drag). positive for right, negative for left
  const $dragX = $MouseX.derive(sub, e.pageX);
  // $dragLeft is that number added to the actual
  // current left pos of the slider (at the start of the drag)
  // that gives us the "current" derivable left pos of the
  // slider
  const $dragLeft = $dragX.derive(add, $sliderLeft.get());

  $$DragLeft.set($dragLeft);
});

window.addEventListener('mouseup', transaction(() => {
  $NoDragColOffset.set($columnOffset.get());
  $$DragLeft.set(null);
}));

window.addEventListener('load', () => {
  document.body.appendChild(header)
  document.body.appendChild(slider)
});

// press left and right arrow keys to change column offset
window.addEventListener('keydown', e => {
  console.log(e.keyCode);
  switch (e.keyCode) {
    case 39: $NoDragColOffset.swap(add, 1); break;
    case 37: $NoDragColOffset.swap(sub, 1); break;
    case 38: $TotalColumns.swap(add, 1); break;
    case 40: $TotalColumns.swap(sub, 1); break;
  }
})
