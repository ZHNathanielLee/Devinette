// Copyright (c) 2009 Zhaohai Nathaniel Lee <ZHNathanielLee@gmail.com>
// Distributed under the Apache License, Version 2.0

var PasswordText         = document.createTextNode("");
var LengthText           = document.createTextNode("");
var CharacterSetSizeText = document.createTextNode("");
var EntropyText          = document.createTextNode("");

document.getElementById("Password").appendChild(PasswordText);
document.getElementById("Length").appendChild(LengthText);
document.getElementById("CharacterSetSize").appendChild(CharacterSetSizeText);
document.getElementById("Entropy").appendChild(EntropyText);

var compUint32Array, compCrypto, compGetRandomValues;

if (typeof Uint32Array == "function")
	compUint32Array = true;
if ("crypto" in window)
	compCrypto = true;
if ("getRandomValues" in window.crypto)
	compGetRandomValues = true;

function makeCheck(element) {
	document.getElementById(element).checked = true;
}

function isCheck(element) {
	return document.getElementById(element).checked;
}

function getValue(element) {
	return document.getElementById(element).value;
}

function getCharacterSet() {
	var CharacterSet = "";
	if (isCheck("Numbers"))
		CharacterSet += "0123456789";
	if (isCheck("LowerCase"))
		CharacterSet += "abcdefghijklmnopqrstuvwxyz";
	if (isCheck("UpperCase"))
		CharacterSet += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	if (isCheck("ACSIISymbols"))
		CharacterSet += "!@#$%^&*()[]{}~`_+<>?,./";
	if (isCheck("Space"))
		CharacterSet += " ";
	if (isCheck("Custom"))
		CharacterSet += getValue("CustomStr");
	return removeDuplicates(CharacterSet).replace(/ /, "\u00A0");
}

function getLength(numCharacterSet) {
	if (isCheck("FixedLength"))
		return parseInt(getValue("numLength"), 10);
	else if (isCheck("FixedEntropy"))
		return Math.ceil(parseFloat(getValue("numEntropy")) * Math.LN2 / Math.log(numCharacterSet));
	else
		throw "Length error";
}

function getRandomInt(n) {
	var safeRandomInt, unsafeRandomInt = Math.floor(Math.random() * n);
	if (unsafeRandomInt < 0 || unsafeRandomInt >= n)
		throw "Random Error";
	if (compUint32Array && compCrypto && compGetRandomValues) {
		var uintArray = new Uint32Array(1);
		do window.crypto.getRandomValues(uintArray);
		while ((uintArray[0] - uintArray[0] % n) > (Math.pow(2, 32) - n));
		safeRandomInt = uintArray[0] % n;
		return (unsafeRandomInt * Math.PI + safeRandomInt * Math.E) % n;
	} else
		return (unsafeRandomInt * Math.PI + Math.E) % n
}

function Generate() {
	var CharacterSet = getCharacterSet(),
		numCharacterSet = CharacterSet.length,
		Length = getLength(numCharacterSet);
	CharacterSetSizeText.data = numCharacterSet;
	EntropyText.data = getApproximate(Math.log(numCharacterSet) * Length / Math.LN2);
	LengthText.data = Length;
	if (numCharacterSet < 0)
		alert("Character set is empty");
	else if ((Length < 1) || (Length > 65535))
		alert("Invalid password length");
	else
		PasswordText.data = getPassword(Length, CharacterSet, numCharacterSet);
}

function getPassword(Len, Cset, numCset) {
	var Password = "";
	for (var i = 0; i < Len; i++)
		Password += Cset.charAt(getRandomInt(numCset));
	return Password;
}

function getApproximate(num) {
	if (num < 70)
		return num.toFixed(2);
	else if (num < 210)
		return num.toFixed(1);
	else
		return num.toFixed(0);
}

function removeDuplicates(str) {
	var result = "";
	for (var i = 0; i < str.length; i++)
		if (result.indexOf(str.charAt(i)) == -1)
			result += str.charAt(i);
	return result;
}

function makeCustomCheck() {
	makeCheck("Custom");
}

function makeFixedLengthCheck() {
	makeCheck("FixedLength");
}

function makeFixedEntropyCheck() {
	makeCheck("FixedEntropy");
}
