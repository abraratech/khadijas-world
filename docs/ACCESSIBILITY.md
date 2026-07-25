# Accessibility

Release 1 exposes the QUALITY.1 comfort controls in the player Settings panel:

- gentle motion
- larger words
- stronger control colors
- instant neighborhood replies
- music and sound-effects controls
- character idle-animation control
- autonomous small-movement control
- fullscreen where the browser supports it

Keyboard focus has a visible outline. Title, pause, parent, credits, privacy, and
chat controls use native buttons and inputs. NPC topics and typed chat can be
used without a mouse, and character movement ignores game shortcuts while the
player is typing in an HTML control. Escape closes the active conversation,
popover, release panel, or pause menu.

Touch targets are enlarged at coarse-pointer and narrow-screen breakpoints. The
game prevents page scrolling over the play surface. Landscape is the intended
phone orientation; portrait remains usable for menus but provides a smaller
play view.

Known limits: the 3D play canvas is not a full screen-reader equivalent for the
visual world, focus is managed to the first control when opening major panels
but is not trapped, and no spoken narration or remappable control system exists.
