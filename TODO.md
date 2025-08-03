# TODO

August 2 2025

Need to do a bunch of cleanup now

And need to get detail display to be a pop out with smaller text and things nicely grouped etc

And also need to hide away the darkmode icon on small screens

July 31 2025

Need to try this clamp shit: https://css-tricks.com/linearly-scale-font-size-with-css-clamp-based-on-the-viewport/
then can scale without a media query honestly, and just have everything still as REM

I've got a png favicon, can try redeploying with that and then I think works in safari

July 30 2025

Okay it looks pretty cute now lol I don't have it anymore

I think the big thing is to fix the bear + get the sound stuff working

And it would be nice to add a dark mode + campfire for the bear that lights up in dark mode :)

So yeah that should be next steps lol

And getting it deployed so can see on phone and shit

Getting the main view to be a proper flexbox would be nice ig...? and some media queries to make the bear go below when screen is small and remove the flex 3 columns ig

Oh also make a little animation for the tuner pegs on top
    when tuned --> shrink in and scale up a bit, then return to normal size

Also it looks weird on windows so fix that
  - Colors kinda off
  - Start button not black?
  - The SVG has a dif color background to the card...?

July 29 2025

Honestly wondering if it's even worth finishing this shit lol

Like the tuner only works so well............. kinda pissing me off
But rewriting the actual pitch detection seems horrible
And in general mic tuners are only so good.....

idk lol

It's worth just getting it functional enough to be deployed and all at least which is pretty close

But idk if I'll bother with the full range of features

It was kinda enough practice now should go spend time applying and shit

July 29 2025

The many rerenders might have been half fixed w the refactors but still think maybe a problem

Next would also be nice to have auto/manual selection like GuitarTuna; so click on the string and it enters manual mode, locking to that target note only. Then there is check button for going back to Auto mode

Next steps:
- Break out all the non-pitch info into a new component, and show it to the right of the pitch display
  - So like you can expand/hide it as a detailed info panel
  - Have history there too etc
- Draw waveform on side too somehow
- Then maybe Tailwind time?
- And have to finish pitch display to not look ass and have cents/etc displayed
- Then can do the dropdown for different instruments/etc
- Then note chart + play audio when click
- Then adjusting A4 Hz and scale (include/exclude notes checkboxes)

July 29 2025

Okay so tuning sort of works prolly wanna adjust it later

There's some bug with too many rerenders/too much depth of rerenders w the requestAnimationFrame
In general this is all written like shit soooo

July 28 2025

Dude you got to work faster like come on lock in

This whole thing should be a 1 day project how has it been like a week

Just get the whole bitch done today fuck getting the drawing and shit perfect just get the core features all working then get it styled properly then can work on all the rest yeah

But today goal is to get all done!

(ofc if text or whatever then that takes priority but when working on this - lock in seriously dude lol wtf are you doing working so slow)

July 27 2025

For now just use the shitty targetting system to just get the display and everything working, and then once the rest of the app is made we can try the sticky algo (and then maybe also rolling our own pitch detection)

Having a generic tuner that just goes by nearest note would also be nice if wanna tune w/out sticking to strings like GuitarTuna and instead more like a traditional generic instrument tuner
 - Option to swap to generic which will hide the guitar tuners and then make the pitch display just go by nearest note instead

STICKY ALGO
- Whenever add item to history, reset empty period counter
- Every X ticks, pop end off of history
  - And/or if some empty period elapses with no additions, then clear full history
- Could slide a window over all the history pitches and try to find one which has at least M entries inside it
  - M will represent the min number of points to consider that pitch to be sticky
  - Start from the end (most recent history) and slide backwards; therefore get the latest pitch
  - O(N) time idk if could somehow get better (log N?) but maybe not honestly
  - Idk if this would have issues then if we are between 2 notes; ig just do getNearest on all of them in the set and just choose the one that's larger; would maybe get oscillating back and forth but that honestly makes sense if we are right between two pitches
  - Wait actually ig we wanna take the distance of each pitch to all the possible target notes
    - Set its target as the closest string? or only if within X cents? idk
- Alternatively can do smthng where just count up the 'nearest note' that it detects and see when get X entries
  - Problem is if on a boundary between 2 of them and end up never counting up; so should prolly include notes within a half-step into the count as well maybe? idk
- Both of these seem okay honestly
- Once choose note, store it as the 'sticky' target
  - Sticky target will include {targetNote: number, centsDist: number[] (history of pitch distances)} (???)
  - This will be target note that gets highlighted in tuners display and on the pitch chart
- For pitches going forward, if sticky exists we find distance to it and that gets stored as some dist info with sticky
  - Keep sliding the window tho, but maybe with a larger threshold M? and if detect new note, swap to that as the sticky instead
    - Need some way to prevent quick oscillation of two strings to each other
- Once we stop detecting pitches, drop the larger window threshold so can detect a new pitch more quickly
  - Once we fully clear history after X empty ticks this is even lower (?) idk play with it if necessary if it feels slow to pick up


July 26 2025

Ig the tuning needs to be a bit more complex with the 'stickiness'

Cuz we don't wanna be mid tune on A2 and then we turn the tuner too much and end up closer to E2 instead, and then swap the string to E2; so even tho E2 is now closer, the stickiness should also account for what note you were trying to tune before before swapping

At the same time, if we suddenly transition tuning should also get that

I think need to generally make a list of requirements for the stickiness to have a solid idea of what need and then design some algo ig


July 25 2025

Okay the autocorrelation doesn't actually seem that hard after reading lmao so kinda excited at maybe trying to write it myself later

But also tried out larger fftsize and seems way better need to look more at that and the resolution/etc

Also for octave problem: for history, can check if we ever detected a lower octave in the last X frames/current whatever, and we jump up some octaves, then just interperet at the lower octave instead
- That way get the fundamental frequency more likely
- Subharmonics could be an issue tho.... but don't really think that's relevant at least in the guitar case, idk about other instruments
  - Realistically tho like who cares lmao imma tune the guitar w this shit


July 24 2025

Need to organize these notes somehow lmao

Okay fuck making pitch detection work well actually that shit seems really hard and the resources for it suck I need to find some audio processing textbook or some shit and just read that

Some resources tho:
- https://dsp.stackexchange.com/questions/411/tips-for-improving-pitch-detection: some ideas about limiting to harmonics know about
    - ideally they could start playing, if we get some detection to a note they need to tune still and it's consistent enough, get 'sticky' to it
      - Stickiness should prolly involve ignoring frequencies that aren't in the immediate range of that note + limiting min/max frequency to certain harmonics of it
      - Also maybe biasing to selecting the expected base frequency over any detected harmonics?
    - https://gist.github.com/endolith/255291#L38
    - Should also do some filtering on the signal initially maybe, like the suggested windowing thing, and maybe high/lowpass
      - Can adjust the filters to the 'sticky' note as well maybe

- Okay fell down fat rabbit hole again lmao don't even remember what was gonna write here honestly



I think the next step is just shoving things into a context and getting it working even with the shitty pitch detection

Then we can migrate it to Zustland to learn that a bit it seems fun and cleaner
- Not sure how well it works w the fast updates/need some 'subscribe' thing to the store instead of usual access? idk

Then we can introduce Tailwind and migrate to that

And then we'll be done `:)` unless we wanna rewrite the audio processing to not use the pitchy lib and instead roll our own
- Or just add the stickiness shit etc which could be cool

But yeah maybe don't overfocus on it and then we can move on to some other proj/refresh some other language and shit
- C++ and OpenGL would be good honestly, maybe write that basic renderer + fog finally or some microsoft paint type shit in Qt? or Swift.... idk [or ImGUI!]



okay next for note selection:
to get candidate:

compute distance from detected note to all strings
   idk if should just use the midi distance honestly, or can try doing cents and shit (later)

choose the minimum distance as the target
    if it's within some threshold X, actually select it as a valid target


if detect that target for a few iterations, then make it sticky and actually select?


wait.... what if only draw when we are sticky.... that might resolve all the issues w noise and all lmao
    maybe that's literally what guitartuna does honestly...?
    and then the other ideas of ignoring shit that's not close to the sticky note then
    i think there's something there



for getting target/cents/etc:
we wanna do this frequently and based on history, but not prolly every animation frame? or maybe yeah idk
    ig start by just having it use the audio context and recompute every change
    then later we can try having it only rerender ever X frames
    ideally maybe have some sort of 'main loop' that can subscribe methods to that run every X frames
    that main loop does requestAnimationFrame, then goes thru all subscribers, increments their counts, sees if it's been X frames,
    and if so fires their callback and resets the counter
    that way can make the pitch detector go every frame (or every 2 or whatever), but have the tuner go less frequently
    prob is w contexts still gonna rerender every single state change
    but w zustand can put it into a store together and just doing the pitch update every time but the target update less frequently
        ig then the tuner data is the thing that will cause rerenders and nothing will use the audio context directly then
        so tuning data will store a second copy of the detected pitch, etc so that it only updates every X frames less frequently,
        so only get rerenders once tuner has new info, not whenever pitch changes, even for showing the history
    idk maybe need to think a bit more here

--


Okay so note detection and all that shit works

Need to refactor properly so the globalish tuner data and all is somehow passed properly... ig a context honestly but idk feels icky but maybe start there and refactor later

And still the issue of trying to only center the desired pitches, see these:

https://hajim.rochester.edu/ece/sites/zduan/teaching/ece472/projects/2015/Vasilik_Stillings_Cortazar_paper.pdf
https://dsp.stackexchange.com/questions/64339/pitch-detection-which-is-the-most-robust-way-to-distinguish-voiced-from-unvoice
https://dsp.stackexchange.com/questions/29962/how-to-deal-with-low-fundamental-when-using-amdf-for-pitch-extraction/29968#29968
https://dsp.stackexchange.com/questions/22067/what-is-an-amdf/22070#22070
https://github.com/kylebgorman/swipe
https://www.audiolabs-erlangen.de/content/05_fau/professor/00_mueller/02_teaching/2024s_sarntal/01_group_F0/2008_CamachoH_SWIPE_JASA.pdf

prolly start w the paper in the first link, then try the stack exchanges and then the swipe paper maybe


--


NOTE: so I set min at 24.5 (G0) which cuts off most of the issues which were around 22Hz, but still wanna do the windowing for better consistency or random little sounds etc cuz they still happen (and sometimes get like 27Hz random etc)

Need some notion of 'stickiness' for pitch

Cuz like we'll get a run of like 50 82-83 Hz pitches and then suddenly it drops to like 23 Hz for a few with super high confidence

We want to make it retain 83

Prolem is C0 is 16Hz so kinda need to be able to detect as low as like 5Hz at least so can't just set a global min and push out a bunch of freqs
    - Okay apparently human hearing range can't really get here tho; prolly still important to keep around cuz can have a C0 note that has harmonics at higher ranges that you do hear and so would wanna tune to C0 properly but like unless they're tuning an organ or some shit I don't think this matters so whatever just use a cutoff

Ideally could get some sort of volume data and use that? We could tune the min volume a little


Few approaches:

- Write own detector that looks for amplitude jumps and discards data
- Track some sort of window;
    - So like get run of last 10 vals, if new value is some large amount away, then don't use it as the last pitch, but append it to the history
        - Use the latest value that is within the largest nearby class
    - If keep window large enough can maybe avoid issues?
    - Maybe some otsu thresholding esque strat works here sorta?
- Exploit fact know whihc strings wanna tune
    - Use initial pitch info to choose nearest string and become 'sticky' to it
    - Don't swap to new values if they aren't near to this string for a while
- Adjust min volume dynamically?
    - Get volume of last pitch(es) played, make that some baseline
    - If go below, don't use as val, but store into history
    - Eventually window will slide/time will elapse since last pitch heard and clear the baseline
- Honestly more advanced solutions are obv possible but seem hard... would really have to figure out the harmanics, etc, and have some sort of heuristics or some shit for trying to find the real frequencies... so I think really don't overdo it cuz this isn't a real app and you don't have the audio knowledge to really do it substantially better, so what we have now essentially works and it's okay


# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
