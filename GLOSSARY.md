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
A predefined set of Slots on a Page: it fixes how many Slots there are and where each one sits.
_Avoid_: Layout, preset

**Slot**:
A place for one Photo within a Template, empty or filled.
_Avoid_: Frame, placeholder, box

**Position**:
Where a Photo sits inside its Slot.

**Zoom**:
How much a Photo is enlarged inside its Slot.

**Slot editing**:
The mode in which the user adjusts the Position and Zoom of the Photo in a Slot.

**Resolution**:
The number of pixels per inch with which a Photo prints in its Slot.

**Low resolution**:
A Resolution too low for the Photo to print sharply in its Slot. The user is warned and may keep it.

**Single**:
The Template with one Slot.

**Margins mode**:
How a Page uses its space: `framed` (margins around the Slots and a gap between them) or `full bleed` (the Slots reach the edge of the Page, with no margins or gap). Each Page has its own.

**Template strip**:
The row of Template thumbnails below the Worksheet from which the user picks the Template for the current Page. Its thumbnails follow the Margins mode of the current Page.
_Avoid_: Template carousel, template gallery

**Quick preview**:
The row of Page thumbnails in the top bar, with arrows on both sides, from which the user picks the Page to edit. Each thumbnail shows the Page with its Photos and its number; the current Page has a marked border.
