console.log("=== DÉBOGAGE EMAIL-SENDER ===");
console.log("URL params:", window.location.search);
console.log("Param to:", urlParams.get("to"));
console.log("Templates localStorage:", localStorage.getItem("gpa_email_templates"));

// Fonction pour charger les templates avec débogage
function loadTemplates() {
    console.log("Chargement des templates...");
    const templates = JSON.parse(localStorage.getItem("gpa_email_templates") || "[]");
    console.log("Templates trouvés:", templates.length, templates);
    
    const select = document.getElementById("templateSelect");
    console.log("Select element:", select);
    
    select.innerHTML = "<option value=\"\">-- Aucun template --</option>";
    
    templates.forEach(template => {
        console.log("Ajout template:", template.name, template.id);
        const option = document.createElement("option");
        option.value = template.id;
        option.textContent = `${template.name} (${template.type})`;
        select.appendChild(option);
    });
    
    console.log("Options finales dans select:", select.innerHTML);
}
