# TODO

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
