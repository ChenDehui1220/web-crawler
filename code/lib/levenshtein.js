function Lremoveblank(s) {
    if (s.length == 1 && s.charCodeAt(0) == 160) return '';
    if (s.charCodeAt(0) == 160) {
        s = s.substr(1, s.length - 1);
        return removeblank(s);
    } else {
        return s;
    }
}

function Rremoveblank(s) {
    if (s.length == 1 && s.charCodeAt(0) == 160) return '';
    if (s.charCodeAt(s.length - 1) == 160) {
        s = s.substr(0, s.length - 1);
        return Rremoveblank(s);
    } else {
        return s;
    }
}
//end of the function of removing the blank before and after the string

// change multiple blank to one blank in the string
function checkBlank(input_string) {
    //more than 1 blanks
    var re = /([   ]{1,})/g;
    //to one blank
    var r = input_string.replace(re, ' ');
    return r;
}

//remove the blank before and after the string and change multiple blank to one blank in the string
function stringBlankCheck(input_string) {
    var temp = trimBlank(input_string);
    var temp1 = checkBlank(temp);
    return temp1;
}

// end of stringBlankCheck

//according to blank, split string to array
function whiteSpace(input_string) {
    //remove the blank before and after the string and change multiple blank to one blank in the string
    var temp = stringBlankCheck(input_string);

    var strs = new Array();
    //var words = sentence.split(" ");
    strs = temp.split(/\s+/);
    return strs;
}

// remove the blank before and after the string
function trimBlank(str) {
    var r = str.replace(/(^\s*)|(\s*$)/g, '');
    r = Lremoveblank(r);
    r = Rremoveblank(r);
    return r;
};

//Edit distance
function DPA(string1, string2){

    var s1 = stringBlankCheck(string1);
    var s2 = stringBlankCheck(string2);
    var m = new Array();
    var i, j;
    for (i = 0; i < s1.length + 1; i++) 
        m[i] = new Array(); // i.e. 2-D array
    m[0][0] = 0; // boundary conditions
    for (j = 1; j <= s2.length; j++)
        m[0][j] = m[0][j - 1] - 0 + 1; // boundary conditions
    for (i = 1; i <= s1.length; i++) // outer loop
    {
        m[i][0] = m[i - 1][0] - 0 + 1; // boundary conditions
        for (j = 1; j <= s2.length; j++) // inner loop
        {
            var diag = m[i - 1][j - 1];
            var temp1 = s1.charAt(i - 1).toLowerCase();
            var temp2 = s2.charAt(j - 1).toLowerCase();
            if (temp1 != temp2)
                diag++;
            
            m[i][j] = Math.min(diag, // match or change
 Math.min(m[i - 1][j] - 0 + 1, // deletion
 m[i][j - 1] - 0 + 1)) // insertion
        } //for j
    } //for i
    return m[s1.length][s2.length];
} //end of Edit Distance

function levenshtein(s1, s2) {
    var edit_distance = DPA(s1, s2);
    var temp_sim = parseFloat(1 - edit_distance / Math.max(s1.length, s2.length));
    var similarity_temp = temp_sim.toFixed(4);
    var similarity = (similarity_temp * 100).toFixed(2);
    return similarity;
}

module.exports = levenshtein
