 function secondsToString(seconds)
{
var numyears = Math.floor(seconds / 31536000);
var numdays = Math.floor((seconds % 31536000) / 86400); 
var numhours = Math.floor(((seconds % 31536000) % 86400) / 3600);
var numminutes = Math.floor((((seconds % 31536000) % 86400) % 3600) / 60);
var numseconds = (((seconds % 31536000) % 86400) % 3600) % 60;
toreturn = "";
if (numyears != 0)
{
toreturn += numyears + " an" + ((numyears > 1) ? "s ":" ");
}
if (numdays != 0)
{
toreturn +=  numdays + " jour" + ((numdays > 1) ? "s ":" ");
}
if (numhours != 0)
{
toreturn += numhours + " heure" + ((numhours > 1) ? "s ":" "); 
}
if (numminutes != 0)
{
toreturn += numminutes + " minute" + ((numminutes > 1) ? "s ":" ");
}
if (numseconds != 0)
{
 toreturn += numseconds + " seconde" + ((numseconds > 1) ? "s ":" ");
}
return toreturn;

}


