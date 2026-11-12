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
A PDF of the photobook for viewing only. Its Photos have reduced quality, so it is not for printing. It carries a Watermark and a notice that it is not for printing.
_Avoid_: Draft, proof

**PDF preview**:
The dialog the eye button opens. It shows the Quick preview as Facing pages and lets the user download it.

**Facing pages**:
Two Pages shown side by side, as in a magazine. The first Page is shown alone, then Pages 2 and 3, Pages 4 and 5, and so on. If the last Page is even, it is shown alone.
_Avoid_: Spread, double page, page pair

**Watermark**:
The mark "WISKI" with "photobook" below it, that the Quick preview carries over its Photos. The user cannot remove it.

**Cover editing**:
The mode in which the user edits the Cover. The Tool panel replaces the Asset panel, and the Cover preview replaces the Worksheet. The book button turns it on and off.

**Tool panel**:
The panel of Cover editing that takes the place of the Asset panel. It has a fixed size and shows one list at a time: Color schemes, Typefaces or Illustrations.
_Avoid_: Toolbar, sidebar

**Tool menu**:
The row of three text items at the top of the Tool panel: Colores, Tipografías and Ilustraciones. Each item shows its list. It opens on Colores. Selecting a text or an Illustration on the Cover opens the matching list; clearing the selection keeps the list.
_Avoid_: Tabs, toolbar

**Cover preview**:
The front of the Cover as the user sees it during Cover editing, in the proportion of the Product. It is always full bleed.

**Title**:
The large text of the Cover. It starts as "Mi destino favorito".

**Date line**:
The text below the Title. It starts as the current month and year, for example "noviembre 2026".

**Typeface**:
The letter design of a text of the Cover. The user picks it from a list of 10.
_Avoid_: Font

**Illustration**:
A picture on the Cover. The user adds it from the Illustration list, and the Cover can hold many. The user can move, scale and delete each one. A small Illustration starts as an icon of about 30 px.

**Illustration list**:
The list of pictures that the Tool panel shows. It never changes: a click on a picture adds an Illustration to the Cover.
_Avoid_: Catalog, gallery

**Color scheme**:
A pair of colors: the background of the Cover and the color of all its texts. The Tool panel shows each one as a tile with the letters "Aa".

**Selection box**:
The box around the selected Title, Date line or Illustration in the Cover preview. The user drags it to move the element.

**Handle**:
A point on a Selection box. A corner Handle scales a text and its letters, or scales the Illustration. A side Handle changes the width of a text box, and the text wraps again.

