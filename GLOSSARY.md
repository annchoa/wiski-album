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

**Thumbnail panel**:
The row of Page thumbnails in the top bar, with arrows on both sides, from which the user picks the Page to edit. Each thumbnail shows the Page with its Photos and its number; the current Page has a marked border.

**Quick preview**:
A PDF of the photobook for viewing only. Its Photos have reduced quality, so it is not for printing. Every Photo carries a Watermark, and every Page carries a notice that this is a Quick preview.
_Avoid_: Draft, proof

**PDF preview**:
The dialog the eye button opens. It shows the Quick preview as Facing pages and lets the user download it.

**Facing pages**:
Two Pages shown side by side, as in a magazine. The first Page is shown alone, then the pairs follow: Pages 2 and 3, Pages 4 and 5, and so on. If the last Page is even, it is shown alone.
_Avoid_: Spread, double page, page pair

**Watermark**:
The mark "WISKI" with "photobook" below it, drawn on each Photo of the Quick preview. The user cannot remove it.
