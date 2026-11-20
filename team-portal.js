/* Red Planet Team OS — Supabase-backed. Only the publishable anon key belongs in browser code. */
const RP_CONFIG = window.RP_SUPABASE_CONFIG || {};
const RP_SUPABASE_URL = RP_CONFIG.url || "";
const RP_SUPABASE_ANON_KEY = RP_CONFIG.anonKey || "";
const courses = [
{id:"mission",title:"Red Planet mission & operating standards",desc:"Understand the mission, team commitments, communication and daily execution."},
{id:"ai-safe",title:"Using AI safely at work",desc:"Prompting, checking outputs, protecting confidential data and human review."},
{id:"product",title:"Red Planet platform orientation",desc:"Music, artist workflows, AI Studio, TV, collaboration and member services."},
{id:"security",title:"Accounts, privacy & security",desc:"Passwords, MFA, access boundaries, phishing and incident reporting."},
{id:"delivery",title:"Project delivery & KPI basics",desc:"Clear outcomes, evidence, quality checks, blockers and handovers."}
];
let client=null,currentUser=null;
const $=id=>document.getElementById(id);
function say(id,msg){$(id).textContent=msg}
function setReady(ready){$("auth-panel").hidden=ready;$("app-panel").hidden=!ready;$("session-label").textContent=ready?currentUser.email:"Not signed in"}
function initCourses(){ $("learning-list").innerHTML=courses.map(c=>'<article class="learning-card" data-course="'+c.id+'"><b>'+c.title+'</b><p>'+c.desc+'</p><div class="bar"><i style="width:0%"></i></div><button class="secondary course-done" type="button">Mark completed</button></article>').join("");document.querySelectorAll(".course-done").forEach(b=>b.addEventListener("click",()=>completeCourse(b.closest("[data-course]").dataset.course,b)))}
async function completeCourse(id,button){if(!client||!currentUser)return;button.disabled=true;const {error}=await client.from("rp_training_progress").upsert({user_id:currentUser.id,course_code:id,status:"completed",completed_at:new Date().toISOString()},{onConflict:"user_id,course_code"});if(error){say("update-message","Could not save progress: "+error.message);button.disabled=false;return}button.textContent="Completed ✓";button.disabled=false;await loadProgress()}
async function loadProgress(){const {data,error}=await client.from("rp_training_progress").select("course_code,status").eq("user_id",currentUser.id);if(error){say("update-message","Training progress unavailable until migration is applied.");return}const done=new Set((data||[]).filter(x=>x.status==="completed").map(x=>x.course_code));document.querySelectorAll("[data-course]").forEach(card=>{const yes=done.has(card.dataset.course);card.querySelector(".bar i").style.width=yes?"100%":"0%";card.querySelector("button").textContent=yes?"Completed ✓":"Mark completed"});$("learning-count").textContent=Math.round(done.size/courses.length*100)+"%"}

async function loadTrainingMaterials(){
 const root=$("training-material-list");if(!root)return;
 const {data,error}=await client.from("rp_training_materials").select("id,title,course_code,body,visibility,created_at").eq("published",true).order("created_at",{ascending:false}).limit(50);
 if(error){root.textContent="Approved resources unavailable: "+error.message;return;}
 if(!data?.length){root.textContent="No published resources yet.";return;}
 root.innerHTML=data.map(item=>'<article class="item"><div><b>'+escapeHtml(item.title)+'</b><small>'+escapeHtml(item.course_code)+' · '+escapeHtml(item.visibility)+'</small><p>'+escapeHtml(item.body).replace(/\n/g,"<br>")+'</p></div></article>').join("");
}
\nasync function loadTasks(){const {data,error}=await client.from("rp_tasks").select("id,title,status,due_at").eq("assignee_id",currentUser.id).order("created_at",{ascending:false});if(error){$("task-list").innerHTML='<p class="muted">Tasks table unavailable. Apply the Red Planet team migration first.</p>';return}const rows=data||[];$("open-count").textContent=rows.filter(x=>x.status!=="done").length;$("done-count").textContent=rows.filter(x=>x.status==="done").length;$("task-list").innerHTML=rows.length?rows.map(t=>'<article class="item"><div><b>'+escapeHtml(t.title)+'</b><small>'+(t.due_at?"Due "+t.due_at:"No due date")+" · "+t.status+'</small></div><button data-task="'+t.id+'" data-status="'+(t.status==="done"?"todo":"done")+'">'+(t.status==="done"?"Reopen":"Complete")+'</button></article>').join(""):'<p class="muted">No tasks assigned yet. Add your first priority above.</p>';document.querySelectorAll("[data-task]").forEach(b=>b.addEventListener("click",()=>updateTask(b.dataset.task,b.dataset.status)))}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
async function updateTask(id,status){const {error}=await client.from("rp_tasks").update({status}).eq("id",id);if(error){say("update-message",error.message);return}await loadTasks()}
async function loadKpis(){const {data,error}=await client.from("rp_kpis").select("id,title,target_value,current_value,unit").eq("owner_id",currentUser.id).order("created_at",{ascending:false});if(error){$("kpi-list").innerHTML='<p class="muted">No KPI records available yet.</p>';return}const rows=data||[];$("goal-count").textContent=rows.length;$("kpi-list").innerHTML=rows.length?rows.map(k=>'<article class="item"><div><b>'+escapeHtml(k.title)+'</b><small>'+k.current_value+' / '+k.target_value+' '+escapeHtml(k.unit||"")+'</small></div></article>').join(""):'<p class="muted">Your manager has not assigned goals yet.</p>'}
async function loadProfile(){const {data}=await client.from("profiles").select("display_name").eq("id",currentUser.id).maybeSingle();
if(!data){await client.from("profiles").upsert({id:currentUser.id,display_name:currentUser.user_metadata?.display_name||currentUser.email?.split("@")[0]},{onConflict:"id"});}
$("welcome-title").textContent="Welcome"+(data?.display_name?" "+data.display_name:"");const {data:roles}=await client.from("user_roles").select("role").eq("user_id",currentUser.id);$("role-label").textContent=(roles||[]).map(x=>x.role).join(" · ")||"Team member";if((roles||[]).some(x=>x.role==="administrator")){$("admin-panel").hidden=false;await loadTeamMembers();}}
async function loadTeamMembers(){
 const select=$("assigned-member");if(!select)return;
 const {data,error}=await client.from("profiles").select("id,display_name").order("display_name");
 if(error){select.innerHTML='<option value="">Could not load team</option>';say("admin-task-message","Team list unavailable: "+error.message);return;}
 select.innerHTML='<option value="">Choose a team member</option>'+(data||[]).map(p=>'<option value="'+p.id+'">'+escapeHtml(p.display_name||"Team member")+'</option>').join("");
 await loadTeamTasks(data||[]);
}
async function loadTeamTasks(members){
 const root=$("team-list");if(!root)return;
 const {data,error}=await client.from("rp_tasks").select("id,title,status,priority,due_at,assignee_id").order("created_at",{ascending:false}).limit(100);
 if(error){root.textContent="Team tasks unavailable: "+error.message;return;}
 const names=new Map(members.map(p=>[p.id,p.display_name||"Team member"]));
 if(!data?.length){root.textContent="No team tasks have been assigned yet.";return;}
 root.innerHTML=data.map(task=>'<article class="item"><div><b>'+escapeHtml(task.title)+'</b><small>'+escapeHtml(names.get(task.assignee_id)||"Team member")+' · '+escapeHtml(task.priority)+' · '+(task.due_at?"Due "+task.due_at:"No due date")+'</small></div><select data-team-task="'+task.id+'" aria-label="Update task status"><option value="todo">To do</option><option value="doing">In progress</option><option value="blocked">Blocked</option><option value="done">Done</option></select></article>').join("");
 root.querySelectorAll("[data-team-task]").forEach(select=>{const task=data.find(x=>x.id===select.dataset.teamTask);select.value=task.status;select.addEventListener("change",async()=>{const {error:updateError}=await client.from("rp_tasks").update({status:select.value,updated_at:new Date().toISOString()}).eq("id",task.id);say("admin-task-message",updateError?"Could not update task: "+updateError.message:"Team task updated.");});});
}
async function refresh(){await loadProfile();await Promise.all([loadTasks(),loadKpis(),loadProgress(),loadTrainingMaterials()]);setReady(true)}
async function boot(){initCourses();if(!RP_SUPABASE_URL||!RP_SUPABASE_ANON_KEY||!window.supabase){$("setup-warning").hidden=false;$("auth-form").querySelectorAll("input,button").forEach(x=>x.disabled=true);return}client=window.supabase.createClient(RP_SUPABASE_URL,RP_SUPABASE_ANON_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});const {data}=await client.auth.getSession();currentUser=data.session?.user||null;if(currentUser)await refresh();client.auth.onAuthStateChange(async(_event,session)=>{currentUser=session?.user||null;if(currentUser)await refresh();else setReady(false)})}
$("auth-form").addEventListener("submit",async e=>{e.preventDefault();if(!client)return;const {data,error}=await client.auth.signInWithPassword({email:$("email").value,password:$("password").value});say("auth-message",error?error.message:"Signed in.");if(!error){currentUser=data.user;await refresh()}});
$("signup").addEventListener("click",async()=>{if(!client)return;const {data,error}=await client.auth.signUp({email:$("email").value,password:$("password").value});say("auth-message",error?error.message:"Account created. Check your email to verify it, then sign in. An administrator must grant your role before you can access manager features.")});
$("signout").addEventListener("click",async()=>{await client.auth.signOut();currentUser=null;setReady(false)});
$("assign-task-form")?.addEventListener("submit",async e=>{
 e.preventDefault();if(!currentUser)return;
 const title=$("assigned-task-title").value.trim(),assignee=$("assigned-member").value;
 if(!assignee){say("admin-task-message","Choose a team member.");return;}
 const {error}=await client.from("rp_tasks").insert({title,due_at:$("assigned-task-due").value||null,priority:$("assigned-task-priority").value,assignee_id:assignee,created_by:currentUser.id});
 say("admin-task-message",error?"Could not assign task: "+error.message:"Task assigned successfully.");
 if(!error)e.target.reset();
});
$("training-material-form")?.addEventListener("submit",async e=>{
 e.preventDefault();if(!currentUser)return;
 const button=e.target.querySelector("button");button.disabled=true;
 const {error}=await client.from("rp_training_materials").insert({title:$("material-title").value.trim(),course_code:$("material-course").value.trim(),body:$("material-body").value.trim(),visibility:$("material-visibility").value,published:true,created_by:currentUser.id});
 say("material-message",error?"Could not publish resource: "+error.message:"Training resource published.");
 if(!error){e.target.reset();await loadTrainingMaterials();}
 button.disabled=false;
});
$("task-form").addEventListener("submit",async e=>{e.preventDefault();if(!client||!currentUser)return;const title=$("task-title").value.trim();const due=$("task-due").value||null;const {error}=await client.from("rp_tasks").insert({title,due_at:due,assignee_id:currentUser.id,created_by:currentUser.id});if(error){say("update-message",error.message);return}e.target.reset();await loadTasks()});
$("save-update").addEventListener("click",async()=>{if(!client||!currentUser)return;const body=$("daily-update").value.trim();if(!body)return;
const {error}=await client.from("rp_daily_updates").upsert({user_id:currentUser.id,update_date:new Date().toISOString().slice(0,10),body},{onConflict:"user_id,update_date"});
say("update-message",error?"Could not save update: "+error.message:"Daily update saved securely.");});
boot();