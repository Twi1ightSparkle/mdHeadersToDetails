const fs = require('fs');
const prettier = require('prettier');

// Read from ${baseName}.md and write to ${baseName}New.md
const baseName = 'inFile';

// Read the file and split each line into an array
const inFile = fs.readFileSync(`${baseName}.md`, 'utf-8');
const lines = inFile.split(/\r?\n/);

// Strings we'll be using below
let outString = (currentHeader = lastHeader = currentAnswer = '');

// Return a details section from a header and some text
function createSection(header, text) {
    header = header.replace(/^#+ /, '');
    return `
<details>
    <summary>${header}</summary>

${text.trim()}
</details>
`;
}

// Loop over each line from the read file
lines.forEach((line) => {
    // If the current line is a header
    //   copy the old value of currentHeader to lastHeader,
    //   then save the current line as currentHeader
    if (line.startsWith('#')) {
        lastHeader = currentHeader;
        currentHeader = line;
    }

    // If the current line is not a header, append it to the current answer
    else if (!line.startsWith('#')) {
        currentAnswer += '\n';
        currentAnswer += line;
    }

    // If the current line is a header, and there have been no non-header lines since last header
    // then write the last header to the outString
    if (line.startsWith('#') && currentAnswer.trim().length === 0) {
        outString += `\n${lastHeader}\n`;
    }

    // Else If the current line is a header, and there have been at least one non-header line since the last header,
    // then write the last header and the current answer to the outString as a collapsible block.
    // Then clear currentAnswer to be ready for the next header/answer
    else if (line.startsWith('#') && currentAnswer.trim().length > 0) {
        outString += createSection(lastHeader, currentAnswer);
        currentAnswer = '';
    }
});

// Save the last section from the read document
if (currentHeader !== lastHeader) {
    outString += createSection(currentHeader, currentAnswer);
}

// Format/prettify the generated Markdown
outString = prettier.format(outString, { parser: 'markdown' });

// Write the generated Markdown to a file
fs.writeFileSync(`${baseName}New.md`, outString);

// Done
console.log(`${baseName}.md converted to ${baseName}New.md`);
