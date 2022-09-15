import React from "react";
import ReactDOM from "react-dom";
import epubjs from "epubjs";

import "./styles.css";

class App extends React.Component {
  componentDidMount() {
    setTimeout(() => {
      this.initializeEpub();
    }, 300);
  }

  initializeEpub = (payload) => {
    const scaleRatio = 2;
    const book = epubjs(
      "https://contents-yandexdev.kalpa.store/66/50/131407322114344990_content.epub?rev=4"
    );
    this.book = book;

    const rendition = book.renderTo(this.bookContainer, {
      manager: "continuous",
      flow: "scrolled",
      width: `${100 * scaleRatio}%`,
      height: "100%",
      // `minSpreadWidth' prevents the spread creation (so container keeps 1 column no matter the width)
      // minSpreadWidth: 99999
      layout: "pre-paginated"
    });

    book.ready.then(() => {
      // we need last index, for the epub to render all the sections
      // from the beginning, for some reason large documents are
      // loaded but not rendered (even with "pre-paginated" layout)
      const lastSectionIndex = this.book.spine.items
        ? this.book.spine.items.length - 1
        : 0;

      // telling a library to display the last section to make sure that
      // all of them are rendered and document can be scrolled
      rendition.display(12);
      // rendition.display(lastSectionIndex);
    });

    rendition.on("rendered", () => {
      rendition.getContents().forEach((contents) => {
        // scale the contents
        contents.scaler(1 / scaleRatio);

        // change the height of rendered epub views manually (to get
        // rid of empty space after short sections)
        const newHeight = contents.textHeight() + "px";

        const epubView = this.bookContainer.querySelector(
          `div[ref="${contents.sectionIndex}"]`
        );

        if (!epubView) {
          return;
        }

        epubView.style.height = newHeight;
        epubView.querySelector("iframe").style.height = newHeight;
      });
    });
  };

  render() {
    return (
      <div className="App">
        <div className="container">
          <div className="content">
            <div
              id="epub-preview-root"
              ref={(node) => (this.bookContainer = node)}
            />
          </div>
        </div>
      </div>
    );
  }
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
