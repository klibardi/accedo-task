import React, { useState, useCallback, useRef } from "react";
import styled from "@emotion/styled";
import Video from "./Video";

const initialPlaylist: string[] = [
  "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
  "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
];

const AppContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 100vh;
  width: 100vw;
`;

const PlaylistContainer = styled.div`
  display: flex;
  flex-grow: 0;
  width: 30vw;
  flex-direction: column;
  background-color: lightgray;
  height: 100%;
  overflow-y: auto;
`;

const PlaylistItemContainer = styled.div<{ selected: boolean }>`
  display: flex;
  flex-direction: row;
  cursor: pointer;
  width: 100%;
  padding: 10px;
  font-size: 12px;
  font-weight: ${({ selected }) => (selected ? "bold" : "regular")};
  &:even {
    background-color: aliceblue;
  }
`;

const PlaylistItemTextContainer = styled.div`
  display: flex;
  flex-grow: 1;
  max-width: 80%;
`;

const PlaylistItemRemoveContainer = styled.div`
  display: flex;
  flex-grow: 0;
  width: 40px;
  margin-left: auto;
  margin-right: 0;
`;

const VideoContainer = styled.div`
  display: flex;
  flex-grow: 1;
  max-width: 70vw;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: black;
  height: 100%;
  color: white;
  position: relative;
`;

const ControlsContainer = styled.div`
  display: flex;
  flex-direction: row;
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  color: red;
  padding: 5px;
  background-color: rgba(255, 255, 255, 0.7);
  border-radius: 5px;
`;

const Control = styled.div<{ backgroundImage: string }>`
  margin: 0 5px;
  width: 30px;
  height: 30px;
  background-image: url("${({ backgroundImage }) => backgroundImage}");
  background-size: contain;
  cursor: pointer;
`;

const Input = styled.input`
  border: none;
  background: white;
  border-radius: 3px;
  font-size: 14px;
  margin: 50px 10px 0 10px;
`;

function PlaylistItem({
  index,
  url,
  selected,
  onSelected,
  onRemoved,
}: {
  index: number;
  url: string;
  selected: boolean;
  onSelected: ({ index, url }: { index: number; url: string }) => void;
  onRemoved: ({ index, url }: { index: number; url: string }) => void;
}) {
  return (
    <PlaylistItemContainer selected={selected}>
      <PlaylistItemTextContainer onClick={() => onSelected({ index, url })}>
        {url}
      </PlaylistItemTextContainer>
      <PlaylistItemRemoveContainer onClick={() => onRemoved({ index, url })}>
        {`[x]`}
      </PlaylistItemRemoveContainer>
    </PlaylistItemContainer>
  );
}

function App() {
  const videoElement = useRef<HTMLVideoElement>(null);

  const [playlistState, setPlaylistState] = useState<{
    playlist: string[];
    selectedIndex: number | null;
  }>({
    playlist: initialPlaylist,
    selectedIndex: null,
  });
  const [inputValue, setInputValue] = useState<string>("");

  const onSelected = useCallback(
    ({ index, url }: { index: number; url: string }) => {
      setPlaylistState((ps) => ({ ...ps, selectedIndex: index }));
      setTimeout(() => videoElement.current?.play());
    },
    [setPlaylistState],
  );

  const onRemoved = useCallback(
    ({ index }: { index: number }) => {
      setPlaylistState((ps) => {
        const nextPs = [
          ...ps.playlist.slice(0, index),
          ...ps.playlist.slice(index + 1, ps.playlist.length),
        ];
        if (nextPs.length === 0 || ps.selectedIndex === null) {
          return { playlist: nextPs, selectedIndex: null };
        } else if (ps.selectedIndex === null) {
          return { playlist: nextPs, selectedIndex: null };
        } else if (index > ps.selectedIndex) {
          return { playlist: nextPs, selectedIndex: ps.selectedIndex };
        } else {
          return {
            playlist: nextPs,
            selectedIndex: !!nextPs[index] ? index : 0,
          };
        }
      });
      setTimeout(() => {
        if (playlistState.selectedIndex !== null) {
          videoElement.current?.play();
        } else {
          videoElement.current?.pause();
          if (videoElement.current) {
            videoElement.current.currentTime = 0;
          }
        }
      });
    },
    [playlistState, setPlaylistState],
  );

  const { playlist, selectedIndex } = playlistState;

  return (
    <AppContainer>
      <VideoContainer>
        <Video ref={videoElement} src={playlist[selectedIndex!]} />
        <ControlsContainer>
          <Control
            backgroundImage="/previous.svg"
            onClick={() => {
              if (playlistState.playlist.length === 0) {
                return;
              }
              setPlaylistState((ps) => {
                if (ps.selectedIndex !== null) {
                  return {
                    ...ps,
                    selectedIndex:
                      ps.selectedIndex === 0
                        ? ps.playlist.length - 1
                        : ps.selectedIndex - 1,
                  };
                } else {
                  return { ...ps, selectedIndex: ps.playlist.length - 1 };
                }
              });
              setTimeout(() => videoElement.current?.play());
            }}
          />
          <Control
            backgroundImage="/backward.svg"
            onClick={() => {
              if (playlistState.playlist.length === 0) {
                return;
              }
              setTimeout(() => {
                if (videoElement.current) {
                  videoElement.current.currentTime = Math.max(
                    0,
                    videoElement.current.currentTime - 10,
                  );
                }
              });
            }}
          />
          <Control
            backgroundImage="/play.svg"
            onClick={() => {
              if (playlistState.playlist.length === 0) {
                return;
              }
              setPlaylistState((ps) => ({
                ...ps,
                selectedIndex: ps.selectedIndex === null ? 0 : ps.selectedIndex,
              }));
              setTimeout(() => videoElement.current?.play());
            }}
          />
          <Control
            backgroundImage="/pause.svg"
            onClick={() => {
              setTimeout(() => {
                if (playlistState.playlist.length === 0) {
                  return;
                }
                videoElement.current?.pause();
              });
            }}
          />
          <Control
            backgroundImage="/forward.svg"
            onClick={() => {
              if (playlistState.playlist.length === 0) {
                return;
              }
              setTimeout(() => {
                if (videoElement.current) {
                  videoElement.current.currentTime = Math.min(
                    videoElement.current.duration,
                    videoElement.current.currentTime + 10,
                  );
                }
              });
            }}
          />
          <Control
            backgroundImage="/next.svg"
            onClick={() => {
              if (playlistState.playlist.length === 0) {
                return;
              }
              setPlaylistState((ps) => {
                if (ps.selectedIndex !== null) {
                  return {
                    ...ps,
                    selectedIndex:
                      ps.selectedIndex === ps.playlist.length - 1
                        ? 0
                        : ps.selectedIndex + 1,
                  };
                } else {
                  return { ...ps, selectedIndex: 0 };
                }
              });
              setTimeout(() => videoElement.current?.play());
            }}
          />
        </ControlsContainer>
      </VideoContainer>
      <PlaylistContainer>
        {playlist.map((url, idx) => (
          <PlaylistItem
            key={url}
            index={idx}
            url={url}
            selected={selectedIndex === idx}
            onSelected={onSelected}
            onRemoved={onRemoved}
          />
        ))}
        <Input
          placeholder="Provide video url and press enter to add..."
          value={inputValue}
          onChange={(e) => setInputValue(e.currentTarget.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !!e.currentTarget.value) {
              setPlaylistState((ps) => ({
                ...ps,
                playlist: [...ps.playlist, inputValue],
              }));
              setInputValue("");
            }
          }}
        />
      </PlaylistContainer>
    </AppContainer>
  );
}

export default App;
