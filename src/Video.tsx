import { forwardRef } from "react";
import styled from "@emotion/styled";

const VideoElement = styled.video`
  width: 70vw;
`;

const Video = forwardRef<HTMLVideoElement, { src: string | undefined }>(
  function Video({ src }, ref) {
    return src ? <VideoElement ref={ref} src={src} /> : null;
  },
);

export default Video;
