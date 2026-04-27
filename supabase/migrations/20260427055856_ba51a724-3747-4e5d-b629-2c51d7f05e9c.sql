
DROP TRIGGER IF EXISTS essential_homeo_drugs_search_trg ON public.essential_homeopathy_drugs;

CREATE OR REPLACE FUNCTION public.essential_homeo_drugs_refresh_search()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  NEW.search_text := lower(concat_ws(' ',
    NEW.name, NEW.kingdom, NEW.latin_name, NEW.common_name,
    NEW.reference_text, NEW.dose, NEW.precautions, NEW.description,
    array_to_string(COALESCE(NEW.indications,'{}'),' '),
    array_to_string(COALESCE(NEW.keynotes,'{}'),' '),
    array_to_string(COALESCE(NEW.available_potencies,'{}'),' ')
  ));
  RETURN NEW;
END $$;

CREATE TRIGGER essential_homeo_drugs_search_trg
BEFORE INSERT OR UPDATE ON public.essential_homeopathy_drugs
FOR EACH ROW EXECUTE FUNCTION public.essential_homeo_drugs_refresh_search();
