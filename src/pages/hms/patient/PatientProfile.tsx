import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { User, Edit, Save, Brain, Sparkles, Search, Merge } from "lucide-react";
import { getIndianStates } from "@/services/patientAiService";

const PatientProfile = () => {
  const [activeSection, setActiveSection] = useState("personal");
  const [showMergeDialog, setShowMergeDialog] = useState(false);

  // Personal details state
  const [country, setCountry] = useState("India");
  const [source, setSource] = useState("Family");
  const [mobile, setMobile] = useState("9443314670");
  const [title, setTitle] = useState("Mr");
  const [name, setName] = useState("Nagaraj 14233");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState("Male");
  const [regDate, setRegDate] = useState("13/04/2023");
  const [regTime, setRegTime] = useState("14:26");
  const [dob, setDob] = useState("05/06/1961");
  const [ageYears] = useState("65");
  const [ageMonths] = useState("1");
  const [ageDays] = useState("16");
  const [bloodGroup, setBloodGroup] = useState("");
  const [email, setEmail] = useState("");
  const [street, setStreet] = useState("");
  const [area, setArea] = useState("THIRUTHANGAL");
  const [landmark, setLandmark] = useState("THIRUTHANGAL");
  const [city, setCity] = useState("Tirunelveli");
  const [district, setDistrict] = useState("");
  const [stateName, setStateName] = useState("Tamil Nadu");
  const [zip, setZip] = useState("");

  // Additional info
  const [religion, setReligion] = useState("Not Specified");
  const [tag, setTag] = useState("");
  const [fileNo, setFileNo] = useState("");
  const [fileLocation, setFileLocation] = useState("");

  const handleUpdate = () => toast.success("Patient profile updated successfully");

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="border-t-4 border-t-teal-500">
        <CardContent className="p-4">
          <div className="text-center text-teal-600 font-semibold text-lg mb-2">Manage Personal Details</div>
        </CardContent>
      </Card>

      {/* Profile Sections Menu */}
      <Card>
        <CardContent className="p-3">
          <div className="flex flex-wrap gap-2">
            {[
              { id: "personal", label: "Manage Personal Details" },
              { id: "medical-history", label: "Manage Medical History" },
              { id: "certificates", label: "Manage Patient Certificates" },
              { id: "charts", label: "Charts" },
              { id: "vaccination", label: "Vaccination" },
              { id: "tasks", label: "Manage Task" },
              { id: "docket", label: "Manage Docket" },
              { id: "membership", label: "Membership Card" },
              { id: "access", label: "Patient Access" },
              { id: "merge", label: "Merge Duplicate Patient" },
            ].map((item) => (
              <Button
                key={item.id}
                size="sm"
                variant={activeSection === item.id ? "default" : "outline"}
                className={activeSection === item.id ? "bg-orange-600 h-7 text-xs" : "h-7 text-xs"}
                onClick={() => {
                  if (item.id === "merge") { setShowMergeDialog(true); return; }
                  setActiveSection(item.id);
                }}
              >
                {item.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Personal Details Form */}
      {activeSection === "personal" && (
        <Card>
          <CardContent className="p-6">
            <Tabs defaultValue="personal">
              <TabsList>
                <TabsTrigger value="personal">Personal Details</TabsTrigger>
                <TabsTrigger value="additional">Additional Information</TabsTrigger>
              </TabsList>
              <TabsContent value="personal" className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><Label className="font-semibold">Country</Label><Select value={country} onValueChange={setCountry}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="India">India</SelectItem></SelectContent></Select></div>
                  <div><Label className="font-semibold">How do you know us? <span className="text-red-500">*</span></Label><Select value={source} onValueChange={setSource}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Family">Family</SelectItem><SelectItem value="Walk-In">Walk-In</SelectItem><SelectItem value="Online">Online</SelectItem></SelectContent></Select></div>
                </div>
                <div>
                  <Label className="font-semibold">Mobile <span className="text-red-500">*</span> <span className="text-orange-600 text-xs cursor-pointer">Verify Mobile</span></Label>
                  <div className="flex gap-2"><span className="border rounded px-3 py-2 bg-muted text-sm">+91</span><Input value={mobile} onChange={(e) => setMobile(e.target.value)} /></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div><Label>Title</Label><Select value={title} onValueChange={setTitle}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["Mr","Mrs","Ms","Master","Dr","Baby"].map(t=><SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
                  <div><Label>Name <span className="text-red-500">*</span></Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
                  <div><Label>Last Name</Label><Input value={lastName} onChange={(e) => setLastName(e.target.value)} /></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div><Label>Gender</Label><Input value={gender} disabled className="bg-muted" /></div>
                  <div>
                    <Label>Registration Date <span className="text-red-500">*</span></Label>
                    <div className="flex gap-1"><Input value={regDate} onChange={(e) => setRegDate(e.target.value)} /><span className="border rounded px-2 py-2 bg-muted text-xs">Time</span><Input value={regTime} onChange={(e) => setRegTime(e.target.value)} className="w-16" /></div>
                  </div>
                  <div><Label>Blood group</Label><Input value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)} /></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div><Label>DOB</Label><Input value={dob} onChange={(e) => setDob(e.target.value)} /></div>
                  <div><Label>Age</Label><span className="text-sm">Age Is {ageYears}Years {ageMonths}Months {ageDays}Days</span><div className="flex gap-1"><Input value={ageYears} disabled className="w-16" /><Input value={ageMonths} disabled className="w-16" /><Input value={ageDays} disabled className="w-16" /></div></div>
                </div>
                <div><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
                <Separator />
                <h3 className="font-semibold">Address Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2"><Label>Street</Label><Input value={street} onChange={(e) => setStreet(e.target.value)} /></div>
                  <div><Label>Area <span className="text-red-500">*</span></Label><Input value={area} onChange={(e) => setArea(e.target.value)} /></div>
                  <div><Label>Landmark</Label><Input value={landmark} onChange={(e) => setLandmark(e.target.value)} /></div>
                  <div><Label>City</Label><Input value={city} onChange={(e) => setCity(e.target.value)} /></div>
                  <div><Label>District</Label><Input value={district} onChange={(e) => setDistrict(e.target.value)} /></div>
                  <div><Label>State/Union Territory</Label><Select value={stateName} onValueChange={setStateName}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{getIndianStates().map(s=><SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
                  <div><Label>Zip</Label><Input value={zip} onChange={(e) => setZip(e.target.value)} /></div>
                </div>
                <Button onClick={handleUpdate} className="bg-orange-600 hover:bg-orange-700 mt-4">Update</Button>
              </TabsContent>
              <TabsContent value="additional" className="space-y-4 mt-4">
                <h3 className="font-semibold">Additional Info</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div><Label>Religion</Label><Select value={religion} onValueChange={setReligion}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Not Specified">Not Specified</SelectItem><SelectItem value="Hindu">Hindu</SelectItem><SelectItem value="Muslim">Muslim</SelectItem><SelectItem value="Christian">Christian</SelectItem></SelectContent></Select></div>
                  <div><Label>Tag <span className="text-orange-600 text-xs cursor-pointer">Set color</span> <span className="text-orange-600 text-xs cursor-pointer">Reset</span></Label><Input value={tag} onChange={(e) => setTag(e.target.value)} placeholder="Tag" /></div>
                  <div><Label>File No</Label><Input value={fileNo} onChange={(e) => setFileNo(e.target.value)} /></div>
                  <div><Label>File Location</Label><Input value={fileLocation} onChange={(e) => setFileLocation(e.target.value)} /></div>
                </div>
                <Button onClick={handleUpdate} className="bg-orange-600 hover:bg-orange-700">Update</Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Patient Access */}
      {activeSection === "access" && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-teal-600 font-semibold text-lg mb-4">Patient Access</div>
            <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
              <p className="text-red-600 text-sm">* (mandatory fields)</p>
            </div>
            <div className="flex items-center gap-3">
              <strong className="text-sm">Provide Patient Access? :</strong>
              <input type="checkbox" />
            </div>
            <Button className="bg-orange-600 hover:bg-orange-700 mt-4">Save</Button>
          </CardContent>
        </Card>
      )}

      {/* Membership Card */}
      {activeSection === "membership" && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-teal-600 font-semibold text-lg mb-4">Edit Membership Card</div>
            <div className="space-y-4 max-w-md mx-auto">
              <div><Label className="font-semibold">Choose Membership Card <span className="text-red-500">*</span> :</Label><Select><SelectTrigger><SelectValue placeholder="None" /></SelectTrigger><SelectContent><SelectItem value="none">None</SelectItem><SelectItem value="gold">Gold Card</SelectItem><SelectItem value="silver">Silver Card</SelectItem></SelectContent></Select><p className="text-xs text-orange-600 mt-1">If card is not there, Please define them in the Master Membershipcard Master</p></div>
              <div><Label className="font-semibold">Card No:</Label><Input placeholder="Card Reference No" disabled className="bg-muted" /></div>
              <div><Label className="font-semibold">Validity Date <span className="text-red-500">*</span> :</Label><Input type="date" /></div>
              <div><Label className="font-semibold">Additional Info :</Label><textarea className="w-full border rounded p-2 text-sm" rows={3} placeholder="Add any additional information" /></div>
              <Button className="bg-orange-600 hover:bg-orange-700">Create</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Medical History */}
      {activeSection === "medical-history" && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-teal-600 font-semibold text-lg mb-4">Manage Medical History</div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label className="font-semibold">Medical History</Label><textarea className="w-full border rounded p-2 text-sm" rows={3} placeholder="Past medical conditions (e.g., Diabetes, Hypertension)" /></div>
                <div><Label className="font-semibold">Family History</Label><textarea className="w-full border rounded p-2 text-sm" rows={3} placeholder="Family medical history" /></div>
                <div><Label className="font-semibold">Drug History</Label><textarea className="w-full border rounded p-2 text-sm" rows={3} placeholder="Current/past medications" /></div>
                <div><Label className="font-semibold">Surgical History</Label><textarea className="w-full border rounded p-2 text-sm" rows={3} placeholder="Past surgeries" /></div>
                <div><Label className="font-semibold">Allergies</Label><Input placeholder="e.g., Penicillin, Peanuts, Dust" /></div>
                <div><Label className="font-semibold">Habits / Social</Label><Input placeholder="e.g., Smoking, Alcohol, Betel" /></div>
              </div>
              <Button onClick={() => toast.success("Medical history saved")} className="bg-orange-600 hover:bg-orange-700">Save Medical History</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Certificates */}
      {activeSection === "certificates" && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-teal-600 font-semibold text-lg mb-4">Manage Patient Certificates</div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div><Label className="font-semibold">Location</Label><Input value="#11, Main Road, Kadayanallur" readOnly className="bg-muted" /></div>
                <div><Label className="font-semibold">Certificate Template *</Label><Select><SelectTrigger><SelectValue placeholder="Select Template" /></SelectTrigger><SelectContent><SelectItem value="fitness">Fitness Certificate</SelectItem><SelectItem value="medical">Medical Certificate</SelectItem><SelectItem value="discharge">Discharge Certificate</SelectItem><SelectItem value="leave">Leave Certificate</SelectItem></SelectContent></Select></div>
                <div className="flex items-end"><Button className="bg-orange-600 hover:bg-orange-700">Generate Certificate</Button></div>
              </div>
              <p className="text-sm text-muted-foreground">No certificates generated yet.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts */}
      {activeSection === "charts" && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-teal-600 font-semibold text-lg mb-4">Patient Charts</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: "Blood Pressure", values: ["130/85", "128/82", "125/80"], dates: ["Jul 10", "Jul 15", "Jul 21"] },
                { label: "Blood Sugar (Fasting)", values: ["145", "138", "132"], dates: ["Jul 10", "Jul 15", "Jul 21"] },
                { label: "Weight (kg)", values: ["78", "77.5", "77"], dates: ["Jun 21", "Jul 10", "Jul 21"] },
              ].map(chart => (
                <Card key={chart.label} className="border">
                  <CardContent className="p-4">
                    <p className="text-sm font-semibold mb-2">{chart.label}</p>
                    <div className="space-y-1">
                      {chart.values.map((v, i) => (
                        <div key={i} className="flex justify-between text-xs"><span className="text-muted-foreground">{chart.dates[i]}</span><span className="font-medium">{v}</span></div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3">Note: Full interactive charts available in Vitals & Growth section</p>
          </CardContent>
        </Card>
      )}

      {/* Vaccination */}
      {activeSection === "vaccination" && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-teal-600 font-semibold text-lg mb-4">Vaccination Record</div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div><Label className="font-semibold">Vaccine Name *</Label><Select><SelectTrigger><SelectValue placeholder="Select Vaccine" /></SelectTrigger><SelectContent><SelectItem value="covid">COVID-19 (Covishield)</SelectItem><SelectItem value="flu">Influenza</SelectItem><SelectItem value="hepatitis">Hepatitis B</SelectItem><SelectItem value="tetanus">Tetanus Toxoid</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent></Select></div>
                <div><Label className="font-semibold">Dose No.</Label><Input type="number" placeholder="1" /></div>
                <div><Label className="font-semibold">Date Given</Label><Input type="date" /></div>
                <Button className="bg-orange-600 hover:bg-orange-700" onClick={() => toast.success("Vaccination record added")}>Add Record</Button>
              </div>
              <p className="text-sm text-muted-foreground">No vaccination records yet.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Manage Task */}
      {activeSection === "tasks" && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-teal-600 font-semibold text-lg mb-4">Manage Task</div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div><Label className="font-semibold">Subject *</Label><Input placeholder="Task subject" /></div>
                <div><Label className="font-semibold">Due Date *</Label><Input type="date" /></div>
                <div><Label className="font-semibold">Assign To</Label><Select><SelectTrigger><SelectValue placeholder="Select User" /></SelectTrigger><SelectContent><SelectItem value="vignesh">Vignesh</SelectItem><SelectItem value="bhavani">Bhavani</SelectItem><SelectItem value="sindhu">Sindhu</SelectItem></SelectContent></Select></div>
                <Button className="bg-orange-600 hover:bg-orange-700" onClick={() => toast.success("Task created for this patient")}>Create Task</Button>
              </div>
              <p className="text-sm text-muted-foreground">No tasks assigned to this patient.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Manage Docket */}
      {activeSection === "docket" && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-teal-600 font-semibold text-lg mb-4">Manage Docket</div>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-6 text-center cursor-pointer hover:bg-muted/30">
                <p className="text-sm">Drag & drop files or click to upload</p>
                <p className="text-xs text-muted-foreground mt-1">Upload prescriptions, reports, documents (PDF, JPG, PNG)</p>
                <Input type="file" multiple accept=".pdf,.jpg,.png,.jpeg" className="mt-3 max-w-[250px] mx-auto" onChange={() => toast.success("File uploaded to docket")} />
              </div>
              <p className="text-sm text-muted-foreground">No documents in docket.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Merge Dialog */}
      <Dialog open={showMergeDialog} onOpenChange={setShowMergeDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle className="text-teal-600">Merge Duplicate Patient</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Label className="font-semibold">Enter Patient ID to merge :</Label>
            <div className="flex gap-2">
              <Input placeholder="Enter Patient ID" />
              <Button className="bg-teal-600"><Search className="h-4 w-4" /></Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PatientProfile;
