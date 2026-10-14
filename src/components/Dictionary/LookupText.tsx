import FrenchWords from './FrenchWords'

/** French text whose words can be clicked to look them up in the offline dictionary. */
export default function LookupText({ text, className }: { text: string; className?: string }) {
  return <FrenchWords text={text} className={className} lang="fr" />
}
