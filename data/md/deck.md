## Deck tab

Cards are presented in sessions. Numbers at the top of this tab show progress in the current session. This tab is displayed with a new session button when all cards in a session have been presented.

Questions are omitted from a session if they are removed, filtered out, or spaced repetition is enabled and the question is not due for presentation in the current session.
Optional question randomization is done at the start of each session. At the end of a session the view returns to the deck tab, with a button to start a new session.

Below the session progress numbers are controls more information and deck-specific settings. The **Header information**, **Filter cards**, **Spaced repetition**, and **Transliteration** sections expand and contract by taping their header. Controls do not appear when they do not apply to the deck.

**Reverse Q & A:** Select to have the question answer presented as the question, and visa versa.

**Show tags in card:** Select to have the card tab include the tags associated with the card.

**Restart:** Remove record of responses so far in the session and start it again.

**Restore removed cards:** Add removed cards back into the deck and restart session.

## Filter cards

A card may have any number of alpha-numeric tags and one numeric tag. Controls on this page allow you to limit the active cards to those that satisfy specified conditions. 

**Range slider:** Use to limit active cards to those whose with numeric values within a selected range.

You may select a collection of alpha-numeric tags associated with each of the following three controls. A tag may be included in at most one of these collections. Tap the edit icon at the right to view a list of all tags in the deck, from which those with those in the control's collection may be selected. Tags already included in one of the other collections are disabled (greyed-out) in these lists. 

**Include tags:** Only cards with one of the indicated tags may be active.

**Exclude tags:** Cards with the indicated tags are not active, regardless of other settings.

**Require tags:** Only cards with all of the indicated tags may be active.

## Spaced repetition

Spaced repetition presents cards at varying intervals, which become longer with correct responses. This utilizes the spacing effect of memory to enhance learning, especially long term recall.

Intervals are measured in sessions. Typically one session is practiced each day, in which case cards with interval three are reviewed every third day. A session may be at the end of more than one interval, in which case cards are presented in decreasing interval order.

When a card is answered correctly it is promoted to the next longer interval, or returned to the same interval if it is the longest. With an incorrect response, the card is moved to the special 0 interval. A session ends when the 0 interval is emptied. (This popular approach to spaced repetition is known as the [Leitner system](https://en.wikipedia.org/wiki/Leitner_system).)

The number of intervals and their lengths default to commonly used values, which you may customize. To reduce the incidence of multiple intervals ending in the same session, interval lengths are prime numbers (up to 367). Cards start in interval 0 when spaced repetition is first enabled, and retain their interval when spaced repetition is disabled.

## Transliteration

Select whether you wish to view Sanskrit text in Devanagari (a traditional script), the deck's transliteration (romanized) font, or both. This does not apply when the deck question involves learning transliteration.