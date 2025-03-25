import './App.css'

import React, { useState, useRef, useEffect } from 'react';
import {
  Stack,
  Container,
  Title,
  Text,
  Button,
  Group,
  Box,
  Center,
  Tooltip,
  Anchor
} from '@mantine/core';


function App() {
  const tooltipTexts = {
    // FG colors
    "30": "Dark Gray (33%)",
    "31": "Red",
    "32": "Yellowish Green",
    "33": "Gold",
    "34": "Light Blue",
    "35": "Pink",
    "36": "Teal",
    "37": "White",
    // BG colors
    "40": "Blueish Black",
    "41": "Rust Brown",
    "42": "Gray (40%)",
    "43": "Gray (45%)",
    "44": "Light Gray (55%)",
    "45": "Blurple",
    "46": "Light Gray (60%)",
    "47": "Cream White",
  };

  const colorMap = {
    // Foreground colors
    "30": "#4f545c",
    "31": "#dc322f",
    "32": "#859900",
    "33": "#b58900",
    "34": "#268bd2",
    "35": "#d33682",
    "36": "#2aa198",
    "37": "#ffffff",
    // Background colors
    "40": "#002b36",
    "41": "#cb4b16",
    "42": "#586e75",
    "43": "#657b83",
    "44": "#839496",
    "45": "#6c71c4",
    "46": "#93a1a1",
    "47": "#fdf6e3"
  };

  const fgColors = [30, 31, 32, 33, 34, 35, 36, 37];
  const bgColors = [40, 41, 42, 43, 44, 45, 46, 47];

  const textarea = useRef(null);
  const [compkey, setcompkey] = useState(0);

  const copybtn = useRef(null);
  const [copyCount, setCopyCount] = useState(0);
  const [copyTimeout, setCopyTimeout] = useState(null);

  useEffect(() => {
    document.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {

        const selection = window.getSelection();
        if (!selection.rangeCount) return;

        const range = selection.getRangeAt(0);
        range.deleteContents();

        const br = document.createElement("br");
        range.insertNode(br);
        range.collapse(false);

        selection.removeAllRanges();
        selection.addRange(range);
        event.preventDefault(); // Prevent default behavior
      }
    });


    textarea.current.focus(); // Auto-focus the input field on mount

    textarea.current.oninput = () => {
      const base = textarea.current.innerHTML.replace(/<(\/?(br|span|span className="ansi-[0-9]*"))>/g, "[$1]");
      if (base.includes("<") || base.includes(">")) textarea.innerHTML = base.replace(/<.*?>/g, "").replace(/[<>]/g, "").replace(/\[(\/?(br|span|span className="ansi-[0-9]*"))\]/g, "<$1>");
    };
  }, []);

  const handleStyleApplication = (e, ansi) => {
    let btn = e.target;
    if (!ansi) {
      textarea.current.innerText = textarea.current.innerText;
      return;
    }

    if (ansi === '0') {
      setcompkey(prev => prev+1)
    }

    const selection = window.getSelection();
    const text = window.getSelection().toString();

    const span = document.createElement("span");
    span.innerText = text;
    span.classList.add(`ansi-${ansi}`);

    const range = selection.getRangeAt(0);
    range.deleteContents();
    range.insertNode(span);

    range.selectNodeContents(span);
    selection.removeAllRanges();
    selection.addRange(range);
  }


  const renderColorButtons = (colors) => (
    <Group>
      {colors.map(color => (
        <Tooltip key={color} label={tooltipTexts[color]} withArrow position="top" px={15} py={5} fw={600} styles={{ tooltip: { fontSize: "1.2rem" } }} >
          <Button
            color="gray"
            bg={colorMap[color]}
            w={43}
            h={43}
            p={0}
            style={{
              boxShadow:'2px 2px 5px rgba(194, 151, 235, 0.3),-2px -2px 5px rgba(194, 151, 235, 0.3)'
            }}
            onClick={(e) => handleStyleApplication(e, color.toString())}
          />
        </Tooltip>
      ))}
    </Group>
  );



  const nodesToANSI = (nodes, states) => {
    let text = ""
    for (const node of nodes) {
      if (node.nodeType === 3) {
        text += node.textContent;
        continue;
      }
      if (node.nodeName === "BR") {
        text += "\n";
        continue;
      }
      const ansiCode = +(node.className.split("-")[1]);
      const newState = Object.assign({}, states.at(-1));

      if (ansiCode < 30) newState.st = ansiCode;
      if (ansiCode >= 30 && ansiCode < 40) newState.fg = ansiCode;
      if (ansiCode >= 40) newState.bg = ansiCode;

      states.push(newState)
      text += `\x1b[${newState.st};${(ansiCode >= 40) ? newState.bg : newState.fg}m`;
      text += nodesToANSI(node.childNodes, states);
      states.pop()
      text += `\x1b[0m`;
      if (states.at(-1).fg !== 2) text += `\x1b[${states.at(-1).st};${states.at(-1).fg}m`;
      if (states.at(-1).bg !== 2) text += `\x1b[${states.at(-1).st};${states.at(-1).bg}m`;
    }
    return text;
  }

  const copyButtonCall = () => {
    const toCopy = "```ansi\n" + nodesToANSI(textarea.current.childNodes, [{ fg: 2, bg: 2, st: 2 }]) + "\n```";
    navigator.clipboard.writeText(toCopy).then(() => {
      if (copyTimeout) clearTimeout(copyTimeout);

      const funnyCopyMessages = copybtn.current.innerText = ["Copied!", "Double Copy!", "Triple Copy!", "Dominating!!", "Rampage!!", "Mega Copy!!", "Unstoppable!!", "Wicked Sick!!", "Monster Copy!!!", "GODLIKE!!!", "BEYOND GODLIKE!!!!", Array(16).fill(0).reduce(p => p + String.fromCharCode(Math.floor(Math.random() * 65535)), "")];

      copybtn.current.style.backgroundColor = (copyCount <= 8) ? "#3BA55D" : "#ED4245";
      copybtn.current.innerText = funnyCopyMessages[copyCount];
      setCopyCount(prev => Math.min(11, prev + 1));

      setCopyTimeout(setTimeout(() => {
        setCopyCount(0);
        copybtn.current.style.backgroundColor = null;
        copybtn.current.innerText = "Copy text as Discord formatted";
      }, 2000))

    }, (err) => {
      // We don't need to stop the users if they get a little too excited about the button
      if (copyCount > 2) return;
      alert("Copying failed for some reason, let's try showing an alert, maybe you can copy it instead.");
      alert(toCopy);
    });
  }




  return (
    <>
      <Container size="" pb={15} key={compkey} c='white'>
        <Container size="md" pb={30}>
          <Stack>
            <Box>
              <Title order={1} pt={20} ta="center" ff="cursive" style={{ textShadow: "4px 4px 5px rgba(194, 151, 235, 0.3),4px 4px 5px rgba(194, 151, 235, 0.3)" }}>
                Sanskar's Discord <Box c="blue" display="inline" >Colored</Box> Text Generator
              </Title>
            </Box>

            <Box w="70%" mx="auto">
              <Title order={2} ta="center" mb={10} ff="cursive">About</Title>

              <Text size='xl' ta="center" lh={1}>This is a simple app that creates colored Discord messages using the ANSI color codes available on the latest Discord desktop versions.</Text>
              <br />
              <Text size='xl' ta="center" lh={1}>To use this, write your text, select parts of it and assign colors to them, then copy it using the button below, and send in a Discord message.</Text>
            </Box>

            <Box w="70%" mx="auto">
              <Title order={2} ta="center" mb={10} ff="cursive">Source Code</Title>

              <Text size='xl' ta="center" lh={1}>
                This app runs entirely in your browser and the source code is freely available on&nbsp;
                <Anchor href="https://github.com/sanskarajput/Discord-Colored-Text-Generator" target="_blank" underline="hover">
                  Github
                </Anchor>
                .&nbsp;Shout out to&nbsp;
                <Anchor href="https://github.com/sanskarajput" target="_blank" underline="hover">
                  sanskarajput
                </Anchor>
                &nbsp;for this.</Text>
            </Box>

            <Box w="70%" mx="auto">
              <Title order={1} ta="center" mb={30} ff="cursive">Create your text</Title>

              <Center>
                <Group gap="sm">
                  <Button fz="xl" color='' onClick={(e) => handleStyleApplication(e, '0')}>Reset All</Button>
                  <Button fz="xl" color='' onClick={(e) => handleStyleApplication(e, '1')}>Bold</Button>
                  <Button fz="xl" color='' onClick={(e) => handleStyleApplication(e, '4')} td="underline">Line</Button>
                </Group>
              </Center>

              <Center mt={20}>
                <Stack>
                  <Group gap={4} >
                    <Text px={10} fw={700} size='xl' style={{ textShadow: "4px 4px 5px rgba(194, 151, 235, 0.3)" }}>FG</Text>
                    {renderColorButtons(fgColors)}
                  </Group>

                  <Group gap={4}>
                    <Text px={10} fw={700} size='xl' style={{ textShadow: "4px 4px 5px rgba(194, 151, 235, 0.3)" }}>BG</Text>
                    {renderColorButtons(bgColors)}
                  </Group>
                </Stack>
              </Center>
            </Box>

            <Box w="90%" mx="auto" mt={16}>
              <Box
                ref={textarea}
                contentEditable
                bd="1px solid rgb(255, 255, 255)"
                bg="#2F3136"
                c="#B9BBBE"
                p="10"
                mt={20}
                mih={200}
                maw="100%"
                ff={'monospace'}
                overflowY='auto'
                style={{
                  overflowY: 'auto',
                  borderRadius: '10px',
                  resize: 'both',
                  boxShadow: '4px 4px 5px rgba(194, 151, 235, 0.3),-4px -4px 5px rgba(194, 151, 235, 0.3)'
                }}
              >
                {/* Default Content */}
                Welcome to&nbsp;<span className="ansi-33">Rebane</span>'s <span className="ansi-45"><span className="ansi-37">Discord</span></span>&nbsp;<span className="ansi-31">C</span><span className="ansi-32">o</span><span className="ansi-33">l</span><span className="ansi-34">o</span><span className="ansi-35">r</span><span className="ansi-36">e</span><span className="ansi-37">d</span>&nbsp;Text Generator!
                {/* Default Content */}
              </Box>
              <Center>
                <Button ref={copybtn} fz="xl" color='' mt={20} onClick={copyButtonCall}>Copy text as Discord formatted !</Button>
              </Center>
            </Box>


          </Stack>
        </Container>
        <Center>
          <Text size='xl'>This is an unofficial tool, it is not made or endorsed by Discord.</Text>
        </Center>
      </Container>
    </>
  )
}

export default App;