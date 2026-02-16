declare module 'react-player' {
    import { Component } from 'react';
    import { ReactPlayerProps } from 'react-player/types/lib';

    export default class ReactPlayer extends Component<ReactPlayerProps> {
        seekTo(amount: number, type?: 'seconds' | 'fraction'): void;
        getCurrentTime(): number;
        getDuration(): number;
        getInternalPlayer(key?: string): any;
    }
}

declare module 'react-player/youtube' {
    import ReactPlayer from 'react-player';
    export default ReactPlayer;
}