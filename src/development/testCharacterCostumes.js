// input for testColorsPale, testColorsDark, and generateCostume
// 'c3f73a-95e06c-68b684-094d92-1c1018'

function testColorsPale(colorString) {
    const colors = colorString.split('-');
    if ('#' + colors[0] === '#null') {
        colors[0] = null;
    } else {
        colors[0] = '#' + colors[0];
    }
    return setHeroColors(Hero, {
        bandanaColor: colors[0],
        earColor: `#FFCC99`,
        hairColor: `yellow`,
        scarfColor: `#${colors[1]}`,
        shirtColor: `#${colors[2]}`,
        shoeColor: `#${colors[3]}`,
        shortsColor: `#${colors[4]}`,
        skinColor: `#FFCC99`
    }); // pink

}

function testColorsDark(colorString) {
    const colors = colorString.split('-');
    if ('#' + colors[0] === '#null') {
        colors[0] = null;
    } else {
        colors[0] = '#' + colors[0];
    }
    return setHeroColors(Hero, {
        bandanaColor: colors[0],
        earColor: `#573719`,
        hairColor: `#222`,
        scarfColor: `#${colors[1]}`,
        shirtColor: `#${colors[2]}`,
        shoeColor: `#${colors[3]}`,
        shortsColor: `#${colors[4]}`,
        skinColor: `#573719`
    }); // dark

}

function generateCostume(colorString, costumeName) {
    const colors = colorString.split('-');
    // make sure output string includes single quotes
    colors[0] = "'" + '#' + colors[0] + "'";
    if (colors[0] === "'#null'") {
        colors[0] = null;
    }
    return `
  const ${costumeName} = {
        bandanaColor: ${colors[0]},
        scarfColor: '#${colors[1]}',
        shirtColor: '#${colors[2]}',
        shoeColor: '#${colors[3]}',
        shortsColor: '#${colors[4]}',
  };
  `;
}

// to see this on the page, you need to disable the styling "page.pagebody {overflow:none}"
// use jobTestColors from characterOutfit.ts for the heroArray
// make sure all of the costume objects from characterOutfit.ts
// are visible to generateHeroCostumeTable()
function generateHeroCostumeTable(heroArray) {
    // remove old testing canvas
    let oldHeroTableCanvas = document.getElementById('hero-table-canvas-for-testing');
    if (oldHeroTableCanvas) {
        oldHeroTableCanvas.remove();
    }
    // create new testing canvas
    const heroTableCanvas = document.createElement('canvas');
    heroTableCanvas.setAttribute('id', 'hero-table-canvas-for-testing');
    heroTableContext = heroTableCanvas.getContext('2d');
    // constants for size of hero sprites and finished table
    const spriteHeight = 48;
    const spriteWidth = 64;
    heroTableCanvas.width = spriteWidth * 2 * 4;
    heroTableCanvas.height = spriteHeight * 2 * 20;
    // x and y for positioning the sprites in a table
    let destinationX = 0;
    let destinationY = 0;
    for (job in heroArray) {
        // job label
        heroTableContext.font = '24px serif';
        heroTableContext.fillStyle = 'white';
        heroTableContext.fillText(job, destinationX + 15, destinationY + (spriteHeight * 1.5));
        // advance x position
        destinationX += spriteWidth * 2;
        for (costume in heroArray[job]) {
            const c = heroArray[job][costume];
            // reformat the costume objects into a string to reuse code from testColorsPale()
            // and testColorsDark() above
            const colorString = `${
                c.bandanaColor === null ? c.bandanaColor : c.bandanaColor.replace('#', '')
            }-${
                c.scarfColor.replace('#', '')
            }-${
                c.shirtColor.replace('#', '')
            }-${
                c.shoeColor.replace('#', '')
            }-${
                c.shortsColor.replace('#', '')
            }`;
            Math.random() > 0.5 ? testColorsPale(colorString) : testColorsDark(colorString);
            // sprites should look pixelated
            heroTableContext.imageSmoothingEnabled = false;
            heroTableContext.drawImage(
                Hero.personCanvas, 0, 0, spriteWidth, spriteHeight,
                destinationX, destinationY, spriteWidth * 2, spriteHeight * 2
            );
            // advance x position
            destinationX += spriteWidth * 2;
        }
        destinationY += spriteHeight * 2;
        // reset x position at end of each row
        destinationX = 0;
    }
    document.body.append(heroTableCanvas);
}
