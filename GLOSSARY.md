# Wiski

Wiski lets people design a printed photobook in the browser: they pick a product, upload photos and arrange them page by page.

## Language

**Product**:
A photobook format the user can order, with a fixed size, cover type and page count (Wiski Route, Wiski Moment).
_Avoid_: Format, model

**Page**:
One printed sheet side of the photobook, edited one at a time.
_Avoid_: Sheet, slide

**Cover** / **Back cover**:
The first and last pieces of the photobook. They are special pages with their own treatment, not numbered with the inner pages.
_Avoid_: Front page, title page

**Worksheet**:
The main area of the editor where the Page being edited is shown and where photos are placed.
_Avoid_: Canvas, board, stage

**Asset panel**:
The left panel of the editor that holds the uploaded photos not currently placed on a Page.
_Avoid_: Sidebar, photo bank, gallery, library

**Photo**:
An image the user uploaded.
_Avoid_: Image, picture, asset

**Template**:
A predefined arrangement of photo positions on a Page.
_Avoid_: Layout, preset

**Slot**:
A photo position within a Template, empty or filled.
_Avoid_: Frame, placeholder, box

**Template strip**:
The row of Template thumbnails in the top bar from which the user picks the Template for the current Page.
_Avoid_: Template carousel, template gallery
