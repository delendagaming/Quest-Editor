function ParagraphTemplate(
  depthNumber,
  paragraphNumber,
  id,
  hasLinkToNextParagraph,
  hasLinkToPreviousParagraph,
  nextParagraphs,
  previousParagraphs,
  paragraphSubTypes,
  paragraphType,
  narrationInputText
) {
  this.depthNumber = depthNumber;
  this.paragraphNumber = paragraphNumber;
  this.id = id;
  this.hasLinkToNextParagraph = hasLinkToNextParagraph;
  this.hasLinkToPreviousParagraph = hasLinkToPreviousParagraph;
  this.nextParagraphs = nextParagraphs;
  this.previousParagraphs = previousParagraphs;
  this.paragraphSubTypes = paragraphSubTypes;
  this.paragraphType = paragraphType;
  this.narrationInputText = narrationInputText;
}

export default ParagraphTemplate;
