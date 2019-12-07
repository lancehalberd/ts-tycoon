import { tagElement } from 'app/dom';
import { exportCharacter } from 'app/saveGame';

export function pasteCharacterToClipBoard(character) {
    const textarea = tagElement('textarea') as HTMLTextAreaElement;
    document.body.appendChild(textarea);
    textarea.value = JSON.stringify(exportCharacter(character));
    textarea.select();
    console.log('Attempting to export character to clipboard: ' + document.execCommand('copy'));
    textarea.remove();
}

export const testCharacters = [
    {"adventurer":{"equipment":{"weapon":null,"body":{"itemKey":"woolshirt","itemLevel":1,"prefixes":[],"suffixes":[],"unique":false},"feet":null,"head":null,"offhand":null,"arms":null,"legs":null,"back":null,"ring":null},"hairOffset":5,"jobKey":"blackbelt","level":1,"name":"Chris"},"board":{"fixed":[{"abilityKey":"blackbelt","shape":{"shapeKey":"diamond","x":145,"y":160,"rotation":300},"confirmed":true,"disabled":false}],"jewels":[{"tier":1,"quality":1.1771743615165253,"components":[0.8103448275862069,0.12931034482758622,0.0603448275862069],"shape":{"shapeKey":"triangle","x":129.99999999999997,"y":134.01923788646687,"rotation":0}},{"tier":1,"quality":1.082823085557029,"components":[0.15517241379310345,0.7758620689655172,0.06896551724137931],"shape":{"shapeKey":"triangle","x":159.99999999999997,"y":134.01923788646687,"rotation":0}},{"tier":1,"quality":1.1500561481574556,"components":[0.1623931623931624,0.06837606837606838,0.7692307692307693],"shape":{"shapeKey":"triangle","x":189.99999999999997,"y":185.9807621135331,"rotation":180}}],"spaces":[{"shapeKey":"diamond","x":145,"y":160,"rotation":300},{"shapeKey":"diamond","x":160,"y":185.98076211353316,"rotation":300},{"shapeKey":"triangle","x":160,"y":134.01923788646684,"rotation":0},{"shapeKey":"diamond","x":130,"y":134.01923788646684,"rotation":300},{"shapeKey":"triangle","x":145,"y":160,"rotation":60}]},"gameSpeed":1,"divinityScores":{},"fame":1,"divinity":0,"currentLevelKey":"meadow","levelCompleted":false,"applicationAge":0},
    {"adventurer":{"equipment":{"weapon":{"itemKey":"ball","itemLevel":1,"prefixes":[],"suffixes":[],"unique":false},"body":{"itemKey":"woolshirt","itemLevel":1,"prefixes":[],"suffixes":[],"unique":false},"feet":null,"head":null,"offhand":null,"arms":null,"legs":null,"back":null,"ring":null},"hairOffset":6,"jobKey":"juggler","level":1,"name":"Rob"},"board":{"fixed":[{"abilityKey":"juggler","shape":{"shapeKey":"triangle","x":167.5,"y":147.00961894323342,"rotation":60},"confirmed":true,"disabled":false}],"jewels":[{"tier":1,"quality":1.1278475358101783,"components":[0.1206896551724138,0.8362068965517241,0.04310344827586207],"shape":{"shapeKey":"triangle","x":137.5,"y":147.00961894323342,"rotation":0}},{"tier":1,"quality":1.0892760795932472,"components":[0.06956521739130435,0.782608695652174,0.14782608695652175],"shape":{"shapeKey":"triangle","x":167.49999999999997,"y":147.00961894323345,"rotation":0}},{"tier":1,"quality":1.059884919268583,"components":[0.14912280701754385,0.7894736842105263,0.06140350877192982],"shape":{"shapeKey":"triangle","x":152.49999999999994,"y":172.99038105676658,"rotation":0}}],"spaces":[{"shapeKey":"triangle","x":167.5,"y":147.00961894323342,"rotation":60},{"shapeKey":"diamond","x":167.5,"y":147.00961894323342,"rotation":300},{"shapeKey":"diamond","x":137.5,"y":147.00961894323342,"rotation":0},{"shapeKey":"diamond","x":182.5,"y":172.99038105676658,"rotation":60}]},"gameSpeed":3,"divinityScores":{},"fame":1,"divinity":0,"currentLevelKey":"grove","levelCompleted":false,"applicationAge":0},
    {"adventurer":{"equipment":{"weapon":{"itemKey":"stick","itemLevel":1,"prefixes":[],"suffixes":[],"unique":false},"body":{"itemKey":"woolshirt","itemLevel":1,"prefixes":[],"suffixes":[],"unique":false},"feet":null,"head":null,"offhand":null,"arms":null,"legs":null,"back":null,"ring":null},"hairOffset":7,"jobKey":"priest","level":1,"name":"Hillary"},"board":{"fixed":[{"abilityKey":"priest","shape":{"shapeKey":"hexagon","x":145,"y":134.01923788646684,"rotation":0},"confirmed":true,"disabled":false}],"jewels":[{"tier":1,"quality":1.0796446126467583,"components":[0.11965811965811966,0.07692307692307693,0.8034188034188035],"shape":{"shapeKey":"triangle","x":174.99999999999997,"y":134.01923788646687,"rotation":0}},{"tier":1,"quality":1.1828199993368098,"components":[0.07563025210084033,0.7563025210084033,0.16806722689075632],"shape":{"shapeKey":"triangle","x":114.99999999999997,"y":134.01923788646687,"rotation":0}},{"tier":1,"quality":1.151132157963968,"components":[0.7758620689655172,0.08620689655172414,0.13793103448275862],"shape":{"shapeKey":"triangle","x":144.99999999999997,"y":185.9807621135332,"rotation":0}}],"spaces":[{"shapeKey":"hexagon","x":145,"y":134.01923788646684,"rotation":0},{"shapeKey":"triangle","x":145,"y":185.98076211353316,"rotation":0},{"shapeKey":"triangle","x":175,"y":134.01923788646684,"rotation":0},{"shapeKey":"triangle","x":190,"y":160,"rotation":60},{"shapeKey":"triangle","x":160,"y":108.03847577293368,"rotation":60},{"shapeKey":"triangle","x":130,"y":160,"rotation":60},{"shapeKey":"triangle","x":115,"y":134.01923788646684,"rotation":0}]},"gameSpeed":1,"divinityScores":{},"fame":1,"divinity":0,"currentLevelKey":"cave","levelCompleted":false,"applicationAge":0},
    {"adventurer":{"equipment":{"weapon":{"itemKey":"primitivebow","itemLevel":2,"prefixes":[],"suffixes":[],"unique":false},"body":{"itemKey":"woolshirt","itemLevel":2,"prefixes":[],"suffixes":[{"affixKey":"toughness","bonuses":{"+armor":2}}],"unique":false},"feet":{"itemKey":"brokensandals","itemLevel":2,"prefixes":[{"affixKey":"relaxing","bonuses":{"+healthRegen":1.3}}],"suffixes":[],"unique":false},"head":{"itemKey":"strawhat","itemLevel":2,"prefixes":[{"affixKey":"relaxing","bonuses":{"+healthRegen":1.9}}],"suffixes":[],"unique":false},"offhand":null,"arms":{"itemKey":"tornmittens","itemLevel":2,"prefixes":[{"affixKey":"relaxing","bonuses":{"+healthRegen":1.7}}],"suffixes":[],"unique":false},"legs":{"itemKey":"tatteredshorts","itemLevel":3,"prefixes":[{"affixKey":"enlarged","bonuses":{"+maxHealth":18}}],"suffixes":[{"affixKey":"toughness","bonuses":{"+armor":5}}],"unique":false},"back":{"itemKey":"quiver","itemLevel":3,"prefixes":[],"suffixes":[{"affixKey":"minordexterity","bonuses":{"+dexterity":5}}],"unique":false},"ring":{"itemKey":"ironband","itemLevel":1,"prefixes":[],"suffixes":[],"unique":false}},"hairOffset":6,"jobKey":"juggler","level":2,"name":"Rob"},"board":{"fixed":[{"abilityKey":"juggler","shape":{"shapeKey":"triangle","x":167.5,"y":147.00961894323342,"rotation":60},"confirmed":true,"disabled":false},{"abilityKey":"sap","shape":{"shapeKey":"triangle","x":167.50000000000003,"y":147.0096189432334,"rotation":180},"confirmed":true,"disabled":true}],"jewels":[{"tier":1,"quality":1.1278475358101783,"components":[0.1206896551724138,0.8362068965517241,0.04310344827586207],"shape":{"shapeKey":"triangle","x":137.5,"y":147.00961894323342,"rotation":0}},{"tier":1,"quality":1.0892760795932472,"components":[0.06956521739130435,0.782608695652174,0.14782608695652175],"shape":{"shapeKey":"triangle","x":167.49999999999997,"y":147.00961894323345,"rotation":0}},{"tier":1,"quality":1.059884919268583,"components":[0.14912280701754385,0.7894736842105263,0.06140350877192982],"shape":{"shapeKey":"triangle","x":152.49999999999994,"y":172.99038105676658,"rotation":0}}],"spaces":[{"shapeKey":"triangle","x":167.5,"y":147.00961894323342,"rotation":60},{"shapeKey":"diamond","x":167.5,"y":147.00961894323342,"rotation":300},{"shapeKey":"diamond","x":137.5,"y":147.00961894323342,"rotation":0},{"shapeKey":"diamond","x":182.5,"y":172.99038105676658,"rotation":60},{"shapeKey":"triangle","x":167.50000000000003,"y":147.0096189432334,"rotation":180},{"shapeKey":"triangle","x":182.5,"y":121.02885682970023,"rotation":120},{"shapeKey":"triangle","x":137.5,"y":147.00961894323342,"rotation":240}]},"gameSpeed":3,"divinityScores":{"grove":12,"cave":12,"meadow":12,"gnometemple":10},"fame":6,"divinity":36,"currentLevelKey":"meadow","levelCompleted":false,"applicationAge":0},
    {"adventurer":{"equipment":{"weapon":{"itemKey":"stick","itemLevel":2,"prefixes":[{"affixKey":"tricky","bonuses":{"+damageOnMiss":10}}],"suffixes":[],"unique":false},"body":{"itemKey":"woolshirt","itemLevel":2,"prefixes":[{"affixKey":"hardy","bonuses":{"+maxHealth":30}}],"suffixes":[],"unique":false},"feet":{"itemKey":"brokensandals","itemLevel":2,"prefixes":[{"affixKey":"enlarged","bonuses":{"+maxHealth":12}}],"suffixes":[],"unique":false},"head":{"itemKey":"oversizedhelmet","itemLevel":2,"prefixes":[],"suffixes":[],"unique":false},"offhand":{"itemKey":"woodenboard","itemLevel":2,"prefixes":[],"suffixes":[],"unique":false},"arms":{"itemKey":"tornmittens","itemLevel":2,"prefixes":[],"suffixes":[{"affixKey":"shininess","bonuses":{"+magicBlock":1}}],"unique":false},"legs":{"itemKey":"tatteredshorts","itemLevel":2,"prefixes":[{"affixKey":"relaxing","bonuses":{"+healthRegen":1.6}}],"suffixes":[],"unique":false},"back":{"itemKey":"quiver","itemLevel":2,"prefixes":[],"suffixes":[{"affixKey":"minorstrength","bonuses":{"+strength":4}}],"unique":false},"ring":{"itemKey":"goldband","itemLevel":2,"prefixes":[],"suffixes":[],"unique":false}},"hairOffset":7,"jobKey":"priest","level":2,"name":"Reuben"},"board":{"fixed":[{"abilityKey":"priest","shape":{"shapeKey":"hexagon","x":145,"y":134.01923788646684,"rotation":0},"confirmed":true,"disabled":false},{"abilityKey":"heal","shape":{"shapeKey":"triangle","x":174.99999999999997,"y":82.05771365940052,"rotation":60},"confirmed":true,"disabled":false}],"jewels":[{"tier":1,"quality":1.135197422292696,"components":[0.11304347826086956,0.06086956521739131,0.8260869565217391],"shape":{"shapeKey":"triangle","x":174.99999999999997,"y":134.01923788646687,"rotation":0}},{"tier":1,"quality":1.0073288612317348,"components":[0.07563025210084033,0.7563025210084033,0.16806722689075632],"shape":{"shapeKey":"triangle","x":114.99999999999997,"y":134.01923788646687,"rotation":0}},{"tier":1,"quality":1.009395871194458,"components":[0.1452991452991453,0.7692307692307693,0.08547008547008547],"shape":{"shapeKey":"triangle","x":144.99999999999997,"y":185.9807621135332,"rotation":0}},{"tier":1,"quality":1.0082310213976926,"components":[0.06086956521739131,0.06956521739130435,0.8695652173913043],"shape":{"shapeKey":"diamond","x":160.00000000000003,"y":108.03847577293368,"rotation":0}},{"tier":1,"quality":1.1,"components":[0.05,0.05,0.9],"shape":{"shapeKey":"triangle","x":205.00000000000006,"y":185.98076211353316,"rotation":180}},{"tier":1,"quality":1.1,"components":[0.05,0.9,0.05],"shape":{"shapeKey":"triangle","x":115,"y":185.98076211353322,"rotation":300}},{"tier":1,"quality":1.1,"components":[0.9,0.05,0.05],"shape":{"shapeKey":"triangle","x":144.99999999999997,"y":82.05771365940052,"rotation":0}}],"spaces":[{"shapeKey":"hexagon","x":145,"y":134.01923788646684,"rotation":0},{"shapeKey":"triangle","x":145,"y":185.98076211353316,"rotation":0},{"shapeKey":"triangle","x":175,"y":134.01923788646684,"rotation":0},{"shapeKey":"triangle","x":190,"y":160,"rotation":60},{"shapeKey":"triangle","x":160,"y":108.03847577293368,"rotation":60},{"shapeKey":"triangle","x":130,"y":160,"rotation":60},{"shapeKey":"triangle","x":115,"y":134.01923788646684,"rotation":0},{"shapeKey":"triangle","x":174.99999999999997,"y":82.05771365940052,"rotation":60},{"shapeKey":"triangle","x":145,"y":82.05771365940052,"rotation":0},{"shapeKey":"triangle","x":189.99999999999997,"y":108.03847577293368,"rotation":120}]},"gameSpeed":3,"divinityScores":{"cave":12,"meadow":12,"grove":10},"fame":4,"divinity":24,"currentLevelKey":"gnometemple","levelCompleted":false,"applicationAge":0},
    {"adventurer":{"equipment":{"weapon":{"itemKey":"cestus","itemLevel":2,"prefixes":[],"suffixes":[],"unique":false},"body":{"itemKey":"woolshirt","itemLevel":1,"prefixes":[],"suffixes":[],"unique":false},"feet":{"itemKey":"brokensandals","itemLevel":1,"prefixes":[],"suffixes":[],"unique":false},"head":{"itemKey":"strawhat","itemLevel":1,"prefixes":[],"suffixes":[],"unique":false},"offhand":{"itemKey":"woodenbowl","itemLevel":1,"prefixes":[],"suffixes":[],"unique":false},"arms":{"itemKey":"tornmittens","itemLevel":1,"prefixes":[],"suffixes":[],"unique":false},"legs":{"itemKey":"tatteredshorts","itemLevel":1,"prefixes":[],"suffixes":[],"unique":false},"back":{"itemKey":"quiver","itemLevel":1,"prefixes":[],"suffixes":[],"unique":false},"ring":{"itemKey":"ironband","itemLevel":1,"prefixes":[],"suffixes":[],"unique":false}},"hairOffset":6,"jobKey":"warrior","level":2,"name":"Hillary"},"board":{"fixed":[{"abilityKey":"warrior","shape":{"shapeKey":"diamond","x":145,"y":160,"rotation":300},"confirmed":true,"disabled":false},{"abilityKey":"vitality","shape":{"shapeKey":"triangle","x":204.99999999999997,"y":160,"rotation":60},"confirmed":true,"disabled":false}],"jewels":[{"tier":1,"quality":1.080809428040149,"components":[0.7894736842105263,0.14035087719298245,0.07017543859649122],"shape":{"shapeKey":"triangle","x":159.99999999999997,"y":134.01923788646687,"rotation":0}},{"tier":1,"quality":1.1155168638424982,"components":[0.7692307692307693,0.15384615384615385,0.07692307692307693],"shape":{"shapeKey":"triangle","x":129.99999999999994,"y":134.0192378864669,"rotation":0}},{"tier":1,"quality":1.1540653119571844,"components":[0.14655172413793102,0.07758620689655173,0.7758620689655172],"shape":{"shapeKey":"triangle","x":174.99999999999991,"y":159.99999999999994,"rotation":60}}],"spaces":[{"shapeKey":"diamond","x":145,"y":160,"rotation":300},{"shapeKey":"trapezoid","x":205,"y":160,"rotation":180},{"shapeKey":"trapezoid","x":115,"y":160,"rotation":0},{"shapeKey":"trapezoid","x":175,"y":211.96152422706632,"rotation":240},{"shapeKey":"trapezoid","x":145,"y":108.03847577293368,"rotation":60},{"shapeKey":"triangle","x":204.99999999999997,"y":160,"rotation":60},{"shapeKey":"triangle","x":174.99999999999997,"y":160,"rotation":0},{"shapeKey":"triangle","x":219.99999999999997,"y":185.98076211353316,"rotation":120}]},"gameSpeed":1,"divinityScores":{"meadow":12,"gnometemple":13},"fame":1541,"divinity":25,"currentLevelKey":"trail","levelCompleted":false,"applicationAge":23}
];
